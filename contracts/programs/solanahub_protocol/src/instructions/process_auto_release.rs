use crate::errors::ErrorCode;
use crate::events::MilestoneReleasedEvent;
use crate::state::{Escrow, Milestone, MilestoneStatus, Project};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(milestone_index: u8)]
pub struct ProcessAutoRelease<'info> {
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
        constraint = milestone.status == MilestoneStatus::Submitted @ ErrorCode::InvalidMilestoneStatus
    )]
    pub milestone: Account<'info, Milestone>,
}

pub fn handler_process_auto_release(
    ctx: Context<ProcessAutoRelease>,
    milestone_index: u8,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let milestone = &mut ctx.accounts.milestone;
    let project = &ctx.accounts.project;

    // Check time
    let clock = Clock::get()?;
    let submitted_at = milestone
        .submitted_at
        .ok_or(ErrorCode::InvalidMilestoneStatus)?;
    let seven_days = 7 * 24 * 60 * 60;

    // Ensure 7 days have passed
    if clock.unix_timestamp < submitted_at + seven_days {
        return Err(ErrorCode::AutoReleaseNotReady.into());
    }

    // Logic similar to release_milestone
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
