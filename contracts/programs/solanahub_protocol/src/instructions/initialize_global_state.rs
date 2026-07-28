use crate::constants::GLOBAL_STATE_SEED;
use crate::state::GlobalState;
use anchor_lang::prelude::*;

pub fn initialize_global_state(ctx: Context<InitializeGlobalState>) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    global_state.total_projects = 0;
    global_state.admin = *ctx.accounts.admin.key;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeGlobalState<'info> {
    #[account(
        init,
        payer = admin,
        space = GlobalState::LEN,
        seeds = [GLOBAL_STATE_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}
