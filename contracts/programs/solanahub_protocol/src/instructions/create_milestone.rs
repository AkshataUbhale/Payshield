use crate::errors::ErrorCode;
use crate::state::{Milestone, MilestoneStatus, Project, ProjectStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(milestone_index: u8)]
pub struct CreateMilestone<'info> {
    #[account(
        mut,
        seeds = [b"project", project.project_id.to_le_bytes().as_ref()],
        bump,
        constraint = project.status == ProjectStatus::InProgress @ ErrorCode::InvalidProjectStatus
    )]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = client, // Client creates/defines milestones usually? Or part of escrow? 
        // Logic: Usually milestones are defined upfront. Here we have create_milestone. 
        // Let's assume client or freelancer can create them to "activate" them or similar.
        // Prompt lib.rs shows create_milestone.
        space = 8 + Milestone::INIT_SPACE,
        seeds = [
            b"milestone",
            project.project_id.to_le_bytes().as_ref(),
            milestone_index.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(mut, constraint = client.key() == project.client @ ErrorCode::Unauthorized)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_create_milestone(
    ctx: Context<CreateMilestone>,
    milestone_index: u8,
    description_hash: [u8; 32],
    amount: u64,
) -> Result<()> {
    let project = &ctx.accounts.project;
    require!(
        milestone_index < project.milestone_count,
        ErrorCode::InvalidMilestoneIndex
    );

    let milestone = &mut ctx.accounts.milestone;
    milestone.project_id = project.project_id;
    milestone.milestone_index = milestone_index;
    milestone.amount = amount;
    milestone.status = MilestoneStatus::Pending;
    milestone.description_hash = description_hash;
    milestone.deliverable_hash = None;
    milestone.bump = ctx.bumps.milestone;

    Ok(())
}
