use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub project_id: u64,
    pub project_pda: Pubkey,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub mint: Pubkey,  // The token mint (USDC)
    pub vault: Pubkey, // The token account holding funds
    pub total_amount: u64,
    pub amount_released: u64,
    #[max_len(10)]
    pub milestone_amounts: Vec<u64>,
    pub bump: u8,
}
