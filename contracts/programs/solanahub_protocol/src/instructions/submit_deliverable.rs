use crate::errors::ErrorCode;
use crate::state::{Milestone, MilestoneStatus, Project};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(milestone_index: u8)]
pub struct SubmitDeliverable<'info> {
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
        constraint = milestone.status == MilestoneStatus::Pending || milestone.status == MilestoneStatus::Active @ ErrorCode::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(
        mut,
        constraint = freelancer.key() == project.freelancer @ ErrorCode::Unauthorized
    )]
    pub freelancer: Signer<'info>,
}

pub fn handler_submit_deliverable(
    ctx: Context<SubmitDeliverable>,
    _milestone_index: u8,
    deliverable_hash: [u8; 32],
) -> Result<()> {
    let milestone = &mut ctx.accounts.milestone;
    milestone.deliverable_hash = Some(deliverable_hash);
    milestone.status = MilestoneStatus::Submitted;
    milestone.submitted_at = Some(Clock::get()?.unix_timestamp);

    Ok(())
}
