use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MessageThread {
    pub participant_a: Pubkey,
    pub participant_b: Pubkey,
    pub last_message_at: i64,
    pub message_count: u64,
    pub bump: u8,
}

#[event]
pub struct MessageSent {
    pub thread_id: Pubkey,
    pub sender: Pubkey,
    pub content_hash: [u8; 32],
    pub timestamp: i64,
}
