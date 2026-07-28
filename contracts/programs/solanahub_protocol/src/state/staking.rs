use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserStake {
    pub user: Pubkey,
    pub amount: u64,
    pub since: i64,
    pub bump: u8,
}
