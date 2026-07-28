use anchor_lang::prelude::*;

#[event]
pub struct ProjectCreatedEvent {
    pub project_id: u64,
    pub client: Pubkey,
    pub total_budget: u64,
}

#[event]
pub struct EscrowInitializedEvent {
    pub project_id: u64,
    pub total_amount: u64,
    pub mint: Pubkey,
}

#[event]
pub struct DisputeRaisedEvent {
    pub dispute_id: u64,
    pub project_id: u64,
    pub milestone_index: u8,
    pub initiator: Pubkey,
}

#[event]
pub struct MilestoneReleasedEvent {
    pub project_id: u64,
    pub milestone_index: u8,
    pub amount: u64,
}
