use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("43QYPVLRMQ9skLbbbZ3uGPsLtTbxcmuU4S5hoZ8bXJKS");

#[program]
pub mod solanahub_protocol {
    use super::*;

    /// Initialize global state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler_initialize(ctx)
    }

    /// Create a new freelance project
    pub fn create_project(
        ctx: Context<CreateProject>,
        title: String,
        description_hash: [u8; 32],
        total_budget: u64,
        milestone_count: u8,
        deadline: i64,
        category: u8,
    ) -> Result<()> {
        instructions::create_project::handler_create_project(
            ctx,
            title,
            description_hash,
            total_budget,
            milestone_count,
            deadline,
            category,
        )
    }

    /// Assign a freelancer to the project
    pub fn assign_freelancer(ctx: Context<AssignFreelancer>, freelancer: Pubkey) -> Result<()> {
        instructions::assign_freelancer::handler_assign_freelancer(ctx, freelancer)
    }

    /// Initialize the escrow for the project
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        project_id: u64,
        milestone_amounts: Vec<u64>,
    ) -> Result<()> {
        instructions::initialize_escrow::handler_initialize_escrow(
            ctx,
            project_id,
            milestone_amounts,
        )
    }

    /// Release funds for a milestone
    pub fn release_milestone(ctx: Context<ReleaseMilestone>, milestone_index: u8) -> Result<()> {
        instructions::release_milestone::handler_release_milestone(ctx, milestone_index)
    }

    /// Create a milestone for the project
    pub fn create_milestone(
        ctx: Context<CreateMilestone>,
        milestone_index: u8,
        description_hash: [u8; 32],
        amount: u64,
    ) -> Result<()> {
        instructions::create_milestone::handler_create_milestone(
            ctx,
            milestone_index,
            description_hash,
            amount,
        )
    }

    /// Submit deliverable for a milestone
    pub fn submit_deliverable(
        ctx: Context<SubmitDeliverable>,
        milestone_index: u8,
        deliverable_hash: [u8; 32],
    ) -> Result<()> {
        instructions::submit_deliverable::handler_submit_deliverable(
            ctx,
            milestone_index,
            deliverable_hash,
        )
    }

    /// Approve a submitted milestone
    pub fn approve_milestone(ctx: Context<ApproveMilestone>, milestone_index: u8) -> Result<()> {
        instructions::approve_milestone::handler_approve_milestone(ctx, milestone_index)
    }

    /// Reject a submitted milestone
    pub fn reject_milestone(ctx: Context<RejectMilestone>, milestone_index: u8) -> Result<()> {
        instructions::reject_milestone::handler_reject_milestone(ctx, milestone_index)
    }

    /// Process auto-release for a milestone
    pub fn process_auto_release(
        ctx: Context<ProcessAutoRelease>,
        milestone_index: u8,
    ) -> Result<()> {
        instructions::process_auto_release::handler_process_auto_release(ctx, milestone_index)
    }

    /// Raise a dispute for a project milestone
    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        project_id: u64,
        milestone_index: u8,
        description_hash: [u8; 32],
    ) -> Result<()> {
        instructions::raise_dispute::handler_raise_dispute(
            ctx,
            project_id,
            milestone_index,
            description_hash,
        )
    }

    /// Cast a vote in a dispute
    pub fn cast_vote(ctx: Context<CastVote>, vote: crate::state::Vote) -> Result<()> {
        instructions::cast_vote::handler_cast_vote(ctx, vote)
    }

    /// Submit a review for a project
    pub fn submit_review(
        ctx: Context<SubmitReview>,
        project_id: u64,
        rating: u8,
        comment_hash: [u8; 32],
    ) -> Result<()> {
        instructions::submit_review::handler_submit_review(ctx, project_id, rating, comment_hash)
    }

    /// Like a social post
    pub fn like_post(ctx: Context<LikePost>, post_id: u64) -> Result<()> {
        instructions::like_post::handler_like_post(ctx, post_id)
    }

    /// Stake tokens
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        instructions::stake::handler_stake(ctx, amount)
    }

    /// Send a message
    pub fn send_message(ctx: Context<SendMessage>, content_hash: [u8; 32]) -> Result<()> {
        instructions::send_message::handler_send_message(ctx, content_hash)
    }

    /// Create a social post
    pub fn create_post(
        ctx: Context<CreatePost>,
        content_hash: [u8; 32],
        post_type: crate::state::PostType,
    ) -> Result<()> {
        instructions::create_post::handler_create_post(ctx, content_hash, post_type)
    }
}
