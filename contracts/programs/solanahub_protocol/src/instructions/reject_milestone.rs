use crate::errors::ErrorCode;
use crate::state::{Milestone, MilestoneStatus, Project};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(milestone_index: u8)]
pub struct RejectMilestone<'info> {
    #[account(
        seeds = [b"project", project.project_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [
            b"milestone",
            project.project_id.to_le_bytes().as_ref(),
            milestone_index.to_le_bytes().as_ref()
        ],
        bump,
        constraint = milestone.status == MilestoneStatus::Submitted @ ErrorCode::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(
        mut,
        constraint = client.key() == project.client @ ErrorCode::Unauthorized
    )]
    pub client: Signer<'info>,
}

pub fn handler_reject_milestone(ctx: Context<RejectMilestone>, _milestone_index: u8) -> Result<()> {
    let milestone = &mut ctx.accounts.milestone;
    // Reset status to Active so freelancer can submit again
    milestone.status = MilestoneStatus::Active;
    // Clear hash? Or keep history? Usually nice to keep history but simpler to overwrite later.
    // Let's keep the hash but clear the submitted_at clock to reset auto-release timer.
    milestone.submitted_at = None;

    Ok(())
}
