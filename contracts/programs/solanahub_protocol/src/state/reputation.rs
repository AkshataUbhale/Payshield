use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Reputation {
    pub user: Pubkey,
    pub total_reviews: u64,
    pub total_score: u64,   // Sum of all ratings
    pub average_rating: u8, // Scaled by 10 or 100? Or just 1-5 integer? Let's use 100 scale (4.5 -> 450) or just u64 logic. Prompt said 1-5 stars. Let's store avg * 100 for precision.
    pub badges: u8,         // Bitmask
    pub total_earnings: u64,
    pub created_at: i64,
    pub bump: u8,
}

pub const BADGE_TOP_RATED: u8 = 1 << 0; // 1
pub const BADGE_FAST_DELIVERY: u8 = 1 << 1; // 2
pub const BADGE_VETERAN: u8 = 1 << 2; // 4
