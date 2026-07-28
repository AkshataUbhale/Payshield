use crate::errors::ErrorCode;
use crate::events::ProjectCreatedEvent;
use crate::state::{GlobalState, Project, ProjectStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = client,
        space = 8 + Project::INIT_SPACE,
        seeds = [b"project", (global_state.total_projects + 1).to_le_bytes().as_ref()],
        bump
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_create_project(
    ctx: Context<CreateProject>,
    title: String,
    description_hash: [u8; 32],
    total_budget: u64,
    milestone_count: u8,
    deadline: i64,
    category: u8,
) -> Result<()> {
    require!(title.len() <= 128, ErrorCode::TitleTooLong);
    require!(
        milestone_count > 0 && milestone_count <= 10,
        ErrorCode::InvalidMilestoneCount
    );
    require!(
        deadline > Clock::get()?.unix_timestamp,
        ErrorCode::InvalidDeadline
    );

    let global_state = &mut ctx.accounts.global_state;
    global_state.total_projects = global_state.total_projects.checked_add(1).unwrap();
    let project_id = global_state.total_projects;

    let project = &mut ctx.accounts.project;
    project.project_id = project_id;
    project.client = ctx.accounts.client.key();
    // freelancer is not assigned yet. Using default/zero key or we can use Option<Pubkey> but struct has Pubkey.
    // Usually we set it to default() or client's key if allowed, but better to check usage.
    // `state` struct has `freelancer: Pubkey`. I'll set it to SystemProgram ID or similar as "null" equivalent, or just client for now to avoid compilation issues with uninit.
    // But `assign_freelancer` will overwrite it.
    project.freelancer = Pubkey::default();

    project.title = title;
    project.description_hash = description_hash;
    project.total_budget = total_budget;
    project.milestone_count = milestone_count;
    project.status = ProjectStatus::Open;
    project.created_at = Clock::get()?.unix_timestamp;
    project.deadline = deadline;
    project.category = category;
    project.bump = ctx.bumps.project;

    emit!(ProjectCreatedEvent {
        project_id,
        client: project.client,
        total_budget,
    });

    Ok(())
}
