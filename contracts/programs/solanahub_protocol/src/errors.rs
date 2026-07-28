use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Title too long (max 128 characters)")]
    TitleTooLong,

    #[msg("Invalid milestone count (must be 1-10)")]
    InvalidMilestoneCount,

    #[msg("Invalid deadline (must be in the future)")]
    InvalidDeadline,

    #[msg("Unauthorized action")]
    Unauthorized,

    #[msg("Project already has a freelancer assigned")]
    FreelancerAlreadyAssigned,

    #[msg("Milestone already released")]
    AlreadyReleased,

    #[msg("Invalid milestone index")]
    InvalidMilestoneIndex,

    #[msg("Invalid project status for this operation")]
    InvalidProjectStatus,

    #[msg("Invalid milestone status")]
    InvalidMilestoneStatus,

    #[msg("Insufficient escrow balance")]
    InsufficientBalance,

    #[msg("Auto-release not ready (must wait 7 days)")]
    AutoReleaseNotReady,

    #[msg("Invalid rating (must be 1-5)")]
    InvalidRating,
}
