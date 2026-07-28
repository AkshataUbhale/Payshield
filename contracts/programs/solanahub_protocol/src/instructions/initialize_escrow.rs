use crate::errors::ErrorCode;
use crate::state::{Escrow, Project, ProjectStatus};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
#[instruction(project_id: u64)]
pub struct InitializeEscrow<'info> {
    #[account(
        mut,
        seeds = [b"project", project_id.to_le_bytes().as_ref()],
        bump,
        constraint = project.status == ProjectStatus::Assigned @ ErrorCode::InvalidProjectStatus
    )]
    pub project: Account<'info, Project>,

    #[account(
        init,
        payer = client,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", project_id.to_le_bytes().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(mut, constraint = client.key() == project.client @ ErrorCode::Unauthorized)]
    pub client: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = client_ata.mint == mint.key(),
        constraint = client_ata.owner == client.key()
    )]
    pub client_ata: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = client,
        associated_token::mint = mint,
        associated_token::authority = escrow,
    )]
    pub escrow_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler_initialize_escrow(
    ctx: Context<InitializeEscrow>,
    project_id: u64,
    milestone_amounts: Vec<u64>,
) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let escrow = &mut ctx.accounts.escrow;

    // Verify milestone amounts equal total budget
    let total_milestone_amount: u64 = milestone_amounts.iter().sum();
    require!(
        total_milestone_amount == project.total_budget,
        ErrorCode::InsufficientBalance
    );
    require!(
        milestone_amounts.len() == project.milestone_count as usize,
        ErrorCode::InvalidMilestoneCount
    );

    // Initialize Escrow State
    escrow.project_id = project_id;
    escrow.project_pda = project.key();
    escrow.client = project.client;
    escrow.freelancer = project.freelancer;
    escrow.mint = ctx.accounts.mint.key();
    escrow.vault = ctx.accounts.escrow_vault.key();
    escrow.total_amount = project.total_budget;
    escrow.amount_released = 0;
    escrow.milestone_amounts = milestone_amounts;
    escrow.bump = ctx.bumps.escrow;

    // Transfer Funds (USDC) from Client to Escrow Vault
    let transfer_accounts = Transfer {
        from: ctx.accounts.client_ata.to_account_info(),
        to: ctx.accounts.escrow_vault.to_account_info(),
        authority: ctx.accounts.client.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );

    token::transfer(cpi_ctx, project.total_budget)?;

    // Update Project Status
    project.status = ProjectStatus::InProgress;

    emit!(crate::events::EscrowInitializedEvent {
        project_id,
        total_amount: project.total_budget,
        mint: escrow.mint,
    });

    Ok(())
}
