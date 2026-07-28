use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Milestone {
    pub project_id: u64,
    pub milestone_index: u8,
    pub amount: u64,
    pub status: MilestoneStatus,
    #[max_len(32)]
    pub description_hash: [u8; 32],
    #[max_len(32)]
    pub deliverable_hash: Option<[u8; 32]>,
    pub submitted_at: Option<i64>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MilestoneStatus {
    Pending,
    Active,
    Submitted,
    Approved,
    Released,
    Disputed,
}
