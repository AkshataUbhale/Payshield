use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalState {
    pub total_projects: u64,
    pub total_disputes: u64,
    pub admin: Pubkey,
    pub bump: u8,
}
