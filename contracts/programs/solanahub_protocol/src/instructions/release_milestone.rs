use crate::errors::ErrorCode;
use crate::events::MilestoneReleasedEvent;
use crate::state::{Escrow, Milestone, MilestoneStatus, Project};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(milestone_index: u8)]
pub struct ReleaseMilestone<'info> {
    #[account(
        seeds = [b"project", project.project_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        seeds = [b"escrow", project.project_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
        mut,
        seeds = [
            b"milestone",
            project.project_id.to_le_bytes().as_ref(),
            milestone_index.to_le_bytes().as_ref()
        ],
        bump,
        constraint = milestone.status == MilestoneStatus::Approved @ ErrorCode::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(
        mut,
        constraint = client.key() == project.client @ ErrorCode::Unauthorized
    )]
    pub client: Signer<'info>,
}

pub fn handler_release_milestone(
    ctx: Context<ReleaseMilestone>,
    milestone_index: u8,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let milestone = &mut ctx.accounts.milestone;
    let project = &ctx.accounts.project;

    // TODO: Transfer funds from escrow PDA to freelancer
    // For now, just updating state

    milestone.status = MilestoneStatus::Released;
    escrow.amount_released = escrow
        .amount_released
        .checked_add(milestone.amount)
        .unwrap();

    emit!(MilestoneReleasedEvent {
        project_id: project.project_id,
        milestone_index,
        amount: milestone.amount,
    });

    Ok(())
}
