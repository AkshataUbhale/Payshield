use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Project {
    pub project_id: u64,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    #[max_len(128)]
    pub title: String,
    #[max_len(32)]
    pub description_hash: [u8; 32],
    pub total_budget: u64,
    pub milestone_count: u8,
    pub status: ProjectStatus,
    pub created_at: i64,
    pub deadline: i64,
    pub category: u8,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ProjectStatus {
    Open,
    Assigned,
    InProgress,
    Completed,
    Disputed,
    Cancelled,
}
