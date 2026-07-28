use crate::state::{Post, PostType};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(content_hash: [u8; 32])] // Used in seed for uniqueness allowing multiple posts
pub struct CreatePost<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + Post::INIT_SPACE,
        seeds = [b"post", author.key().as_ref(), content_hash.as_ref()],
        bump
    )]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler_create_post(
    ctx: Context<CreatePost>,
    content_hash: [u8; 32],
    post_type: PostType,
) -> Result<()> {
    let post = &mut ctx.accounts.post;
    post.author = ctx.accounts.author.key();
    post.content_hash = content_hash;
    post.post_type = post_type;
    post.likes = 0;
    post.created_at = Clock::get()?.unix_timestamp;
    post.bump = ctx.bumps.post;

    Ok(())
}
