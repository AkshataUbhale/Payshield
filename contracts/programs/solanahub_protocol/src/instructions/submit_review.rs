use crate::errors::ErrorCode;
use crate::state::{Project, Reputation, BADGE_TOP_RATED, BADGE_VETERAN};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct SubmitReview<'info> {
    #[account(
        seeds = [b"project", project_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub project: Account<'info, Project>,

    #[account(mut)]
    pub reviewer: Signer<'info>,

    /// CHECK: The user being reviewed (counterparty)
    pub target_user: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = reviewer,
        space = 8 + Reputation::INIT_SPACE,
        seeds = [b"reputation", target_user.key().as_ref()],
        bump,
    )]
    pub reputation: Account<'info, Reputation>,

    pub system_program: Program<'info, System>,
}

pub fn handler_submit_review(
    ctx: Context<SubmitReview>,
    _project_id: u64,
    rating: u8,
    _comment_hash: [u8; 32],
) -> Result<()> {
    let project = &ctx.accounts.project;
    let reviewer = &ctx.accounts.reviewer;
    let target_user = &ctx.accounts.target_user;
    let reputation = &mut ctx.accounts.reputation;

    // Validate reviewer is part of project
    require!(
        reviewer.key() == project.client || reviewer.key() == project.freelancer,
        ErrorCode::Unauthorized
    );

    // Validate target is the other party
    if reviewer.key() == project.client {
        require!(
            target_user.key() == project.freelancer,
            ErrorCode::Unauthorized
        );
    } else {
        require!(target_user.key() == project.client, ErrorCode::Unauthorized);
    }

    // Validate rating
    require!(rating >= 1 && rating <= 5, ErrorCode::InvalidRating);

    if reputation.total_reviews == 0 {
        reputation.user = target_user.key();
        reputation.created_at = Clock::get()?.unix_timestamp;
        reputation.bump = ctx.bumps.reputation;
    }

    reputation.total_reviews += 1;
    reputation.total_score += rating as u64;

    // Calculate average (stored as * 10 for 1 decimal precision, e.g. 4.5 -> 45)
    reputation.average_rating = ((reputation.total_score * 10) / reputation.total_reviews) as u8;

    // Badge Logic
    // Top Rated: Avg >= 4.5 (45) and > 5 reviews
    if reputation.average_rating >= 45 && reputation.total_reviews > 5 {
        reputation.badges |= BADGE_TOP_RATED;
    }
    // Veteran: > 20 reviews
    if reputation.total_reviews > 20 {
        reputation.badges |= BADGE_VETERAN;
    }

    Ok(())
}
