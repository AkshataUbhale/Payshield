use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub author: Pubkey,
    pub content_hash: [u8; 32],
    pub post_type: PostType,
    pub likes: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum PostType {
    Portfolio,
    JobListing,
    Update,
}

#[account]
#[derive(InitSpace)]
pub struct Like {
    pub post: Pubkey,
    pub user: Pubkey,
    pub bump: u8,
}
