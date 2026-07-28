use crate::state::{Like, Post};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct LikePost<'info> {
    #[account(mut)]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + Like::INIT_SPACE,
        seeds = [b"like", post.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub like: Account<'info, Like>,

    pub system_program: Program<'info, System>,
}

pub fn handler_like_post(ctx: Context<LikePost>, _post_id: u64) -> Result<()> {
    let post = &mut ctx.accounts.post;
    let like = &mut ctx.accounts.like;

    post.likes += 1;

    like.post = post.key();
    like.user = ctx.accounts.user.key();
    like.bump = ctx.bumps.like;

    Ok(())
}
