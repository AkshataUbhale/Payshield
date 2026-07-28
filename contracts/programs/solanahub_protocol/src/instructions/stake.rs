use crate::state::UserStake;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStake::INIT_SPACE,
        seeds = [b"stake", user.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"staking_vault"],
        bump,
    )]
    pub staking_vault: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler_stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
    let user_stake = &mut ctx.accounts.user_stake;
    let clock = Clock::get()?;

    // Transfer tokens
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.staking_vault.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Update state
    if user_stake.amount == 0 {
        user_stake.user = ctx.accounts.user.key();
        user_stake.bump = ctx.bumps.user_stake;
    }
    user_stake.amount = user_stake.amount.checked_add(amount).unwrap();
    user_stake.since = clock.unix_timestamp;

    Ok(())
}
