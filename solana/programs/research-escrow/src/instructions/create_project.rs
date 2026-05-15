use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{EscrowVault, ProjectStatus, ResearchEscrowError, ResearchProject};

pub fn handler(
    ctx: Context<CreateProject>,
    _project_id: u64,
    title: String,
    total_amount: u64,
) -> Result<()> {
    require!(
        title.len() <= ResearchProject::MAX_TITLE_LEN,
        ResearchEscrowError::TitleTooLong
    );

    require!(total_amount > 0, ResearchEscrowError::InvalidAmount);

    let project = &mut ctx.accounts.project;
    let escrow_vault = &mut ctx.accounts.escrow_vault;

    project.owner = ctx.accounts.owner.key();
    project.title = title;
    project.total_amount = total_amount;
    project.funded_amount = 0;
    project.current_milestone = 1;
    project.milestone_count = 0;
    project.status = ProjectStatus::Funding;
    project.escrow_vault = escrow_vault.key();
    project.usdc_mint = ctx.accounts.usdc_mint.key();
    project.escrow_token_account = ctx.accounts.escrow_token_account.key();
    project.bump = ctx.bumps.project;

    escrow_vault.project = project.key();
    escrow_vault.bump = ctx.bumps.escrow_vault;

    Ok(())
}

#[derive(Accounts)]
#[instruction(_project_id: u64)]
pub struct CreateProject<'info> {
    #[account(
        init,
        payer = owner,
        space = ResearchProject::SPACE,
        seeds = [
            b"project",
            owner.key().as_ref(),
            _project_id.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub project: Account<'info, ResearchProject>,

    #[account(
        init,
        payer = owner,
        space = EscrowVault::SPACE,
        seeds = [
            b"escrow",
            project.key().as_ref()
        ],
        bump
    )]
    pub escrow_vault: Account<'info, EscrowVault>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        token::mint = usdc_mint,
        token::authority = escrow_vault,
        seeds = [
            b"escrow-token",
            project.key().as_ref()
        ],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
