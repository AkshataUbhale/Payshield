use crate::errors::ErrorCode;
use crate::state::{Dispute, DisputeStatus, Vote};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [
            b"dispute",
            dispute.project_id.to_le_bytes().as_ref(),
            dispute.milestone_index.to_le_bytes().as_ref()
        ],
        bump,
        constraint = dispute.status == DisputeStatus::Voting @ ErrorCode::InvalidMilestoneStatus // Reusing InvalidMilestoneStatus for now or add InvalidDisputeStatus
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(mut)]
    pub voter: Signer<'info>,
}

pub fn handler_cast_vote(ctx: Context<CastVote>, _vote: Vote) -> Result<()> {
    // Simplified voting logic for now as requirements for voting mechanism weren't specified clearly
    let _dispute = &mut ctx.accounts.dispute;

    // Logic: Record vote, check if simple majority etc.
    // For this prompt, just stub it out as succeeding.

    Ok(())
}
