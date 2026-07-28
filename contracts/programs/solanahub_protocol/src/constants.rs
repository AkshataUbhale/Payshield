use anchor_lang::prelude::*;

#[constant]
pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";

#[constant]
pub const PROJECT_SEED: &[u8] = b"project";

#[constant]
pub const ESCROW_SEED: &[u8] = b"escrow";

// Limits
pub const MAX_TITLE_LENGTH: usize = 50;
pub const MAX_DESC_HASH_LENGTH: usize = 64; // IPFS/SHA256 hex
pub const MAX_ID_LENGTH: usize = 32;

// Seeds
pub const MILESTONE_SEED: &[u8] = b"milestone";
pub const DISPUTE_SEED: &[u8] = b"dispute";
pub const REPUTATION_SEED: &[u8] = b"reputation";

// Time constants
pub const AUTO_RELEASE_DELAY: i64 = 7 * 24 * 60 * 60; // 7 days in seconds
pub const JUROR_COUNT: usize = 5;
