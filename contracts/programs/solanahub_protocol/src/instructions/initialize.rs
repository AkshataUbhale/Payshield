use crate::state::GlobalState;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GlobalState::INIT_SPACE,
        seeds = [b"global_state"],
        bump,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_initialize(ctx: Context<Initialize>) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    global_state.total_projects = 0;
    global_state.total_disputes = 0;
    global_state.admin = ctx.accounts.admin.key();
    global_state.bump = ctx.bumps.global_state;
    Ok(())
}
