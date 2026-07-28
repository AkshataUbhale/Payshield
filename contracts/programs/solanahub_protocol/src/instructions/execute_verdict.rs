use crate::constants::JUROR_COUNT;
use crate::errors::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

pub fn execute_verdict(ctx: Context<ExecuteVerdict>) -> Result<()> {
    // Stubbed for debugging
    Ok(())
}

#[derive(Accounts)]
pub struct ExecuteVerdict<'info> {
    #[account(
        mut,
        constraint = dispute.project_id == project.key(),
        // constraint = dispute.milestone_id == milestone.milestone_id
    )]
    pub dispute: Account<'info, Dispute>,
    // #[account(
    //     mut,
    //     seeds = [MILESTONE_SEED, project.key().as_ref(), &[milestone.milestone_id]],
    //     bump = milestone.bump
    // )]
    // pub milestone: Account<'info, Milestone>,
    // #[account(
    //     mut,
    //     seeds = [ESCROW_SEED, project.key().as_ref()],
    //     bump = escrow.bump
    // )]
    // pub escrow: Account<'info, Escrow>,
    #[account(has_one = client, has_one = freelancer)]
    pub project: Account<'info, Project>,
    /// CHECK: Recipient check handled in logic
    #[account(mut)]
    pub client: AccountInfo<'info>,
    /// CHECK: Recipient check handled in logic
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,
}
