use crate::errors::ErrorCode;
use crate::state::{Project, ProjectStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AssignFreelancer<'info> {
    #[account(
        mut,
        seeds = [b"project", project.project_id.to_le_bytes().as_ref()],
        bump,
        constraint = project.status == ProjectStatus::Open @ ErrorCode::InvalidProjectStatus
    )]
    pub project: Account<'info, Project>,

    #[account(
        mut,
        constraint = caller.key() == project.client @ ErrorCode::Unauthorized
    )]
    pub caller: Signer<'info>,
}

pub fn handler_assign_freelancer(ctx: Context<AssignFreelancer>, freelancer: Pubkey) -> Result<()> {
    let project = &mut ctx.accounts.project;
    require!(
        project.freelancer == Pubkey::default(),
        ErrorCode::FreelancerAlreadyAssigned
    );

    project.freelancer = freelancer;
    project.status = ProjectStatus::Assigned; // Or InProgress? Usually Assigned first.

    Ok(())
}
