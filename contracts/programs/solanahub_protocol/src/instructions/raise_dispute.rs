use crate::errors::ErrorCode;
use crate::events::DisputeRaisedEvent;
use crate::state::{Dispute, DisputeStatus, GlobalState, Project, ProjectStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(project_id: u64, milestone_index: u8)]
pub struct RaiseDispute<'info> {
    #[account(
        mut,
        seeds = [b"project", project_id.to_le_bytes().as_ref()],
        bump,
        constraint = project.status == ProjectStatus::InProgress @ ErrorCode::InvalidProjectStatus,
    )]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = initiator,
        space = 8 + Dispute::INIT_SPACE,
        seeds = [
            b"dispute",
            project_id.to_le_bytes().as_ref(),
            milestone_index.to_le_bytes().as_ref()
        ],
        bump,
    )]
    pub dispute: Account<'info, Dispute>,

    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        constraint = initiator.key() == project.client || initiator.key() == project.freelancer @ ErrorCode::Unauthorized
    )]
    pub initiator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_raise_dispute(
    ctx: Context<RaiseDispute>,
    project_id: u64,
    milestone_index: u8,
    description_hash: [u8; 32],
) -> Result<()> {
    let dispute = &mut ctx.accounts.dispute;
    let global_state = &mut ctx.accounts.global_state;
    let project = &mut ctx.accounts.project;

    // Initialize dispute
    dispute.dispute_id = global_state.total_disputes + 1;
    dispute.project_id = project_id;
    dispute.milestone_index = milestone_index;
    dispute.initiator = ctx.accounts.initiator.key();
    dispute.respondent = if ctx.accounts.initiator.key() == project.client {
        project.freelancer
    } else {
        project.client
    };
    dispute.description_hash = description_hash;
    dispute.status = DisputeStatus::Open;
    dispute.created_at = Clock::get()?.unix_timestamp;
    dispute.bump = ctx.bumps.dispute;

    // Update project status
    project.status = ProjectStatus::Disputed;

    // Increment global counter
    global_state.total_disputes = global_state.total_disputes.checked_add(1).unwrap();

    // Emit event
    emit!(DisputeRaisedEvent {
        dispute_id: dispute.dispute_id,
        project_id,
        milestone_index,
        initiator: dispute.initiator,
    });

    Ok(())
}
