use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Dispute {
    pub dispute_id: u64,
    pub project_id: u64,
    pub milestone_index: u8,
    pub initiator: Pubkey,
    pub respondent: Pubkey,
    #[max_len(32)]
    pub description_hash: [u8; 32],
    pub status: DisputeStatus,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum DisputeStatus {
    Open,
    Voting,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum Vote {
    ForInitiator,
    ForRespondent,
    Abstain,
}
