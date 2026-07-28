use crate::state::messaging::MessageSent;
use crate::state::MessageThread;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(
        init_if_needed,
        payer = sender,
        space = 8 + MessageThread::INIT_SPACE,
        seeds = [
            b"thread".as_slice(), 
            if sender.key < recipient.key { sender.key.as_ref() } else { recipient.key.as_ref() },
            if sender.key < recipient.key { recipient.key.as_ref() } else { sender.key.as_ref() }
        ],
        bump
    )]
    pub thread: Account<'info, MessageThread>,

    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: Recipient of the message
    pub recipient: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_send_message(ctx: Context<SendMessage>, content_hash: [u8; 32]) -> Result<()> {
    let thread = &mut ctx.accounts.thread;
    let clock = Clock::get()?;

    if thread.message_count == 0 {
        // Initialize thread
        // Sort keys to ensure unique thread PDA regardless of sender
        let (p_a, p_b) = if ctx.accounts.sender.key() < ctx.accounts.recipient.key() {
            (ctx.accounts.sender.key(), ctx.accounts.recipient.key())
        } else {
            (ctx.accounts.recipient.key(), ctx.accounts.sender.key())
        };
        thread.participant_a = p_a;
        thread.participant_b = p_b;
        thread.bump = ctx.bumps.thread;
    }

    thread.message_count += 1;
    thread.last_message_at = clock.unix_timestamp;

    emit!(MessageSent {
        thread_id: thread.key(),
        sender: ctx.accounts.sender.key(),
        content_hash,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
