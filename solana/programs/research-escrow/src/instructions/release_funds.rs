use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    EscrowVault, Milestone, MilestoneStatus, ProjectStatus, ResearchEscrowError,
    ResearchProject,
};

pub fn handler(ctx: Context<ReleaseFunds>) -> Result<()> {
    let project = &mut ctx.accounts.project;
    let milestone = &mut ctx.accounts.milestone;

    require!(
        project.status == ProjectStatus::Active,
        ResearchEscrowError::ProjectNotActive
    );

    require!(
        milestone.project == project.key(),
        ResearchEscrowError::InvalidMilestoneProject
    );

    require!(
        milestone.order == project.current_milestone,
        ResearchEscrowError::InvalidCurrentMilestone
    );

    require!(
        milestone.status == MilestoneStatus::Approved,
        ResearchEscrowError::MilestoneNotApproved
    );

    require!(
        ctx.accounts.escrow_token_account.amount >= milestone.amount,
        ResearchEscrowError::InsufficientEscrowBalance
    );

    let project_key = project.key();

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"escrow",
        project_key.as_ref(),
        &[ctx.accounts.escrow_vault.bump],
    ]];

    let transfer_accounts = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.researcher_token_account.to_account_info(),
        authority: ctx.accounts.escrow_vault.to_account_info(),
    };

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        signer_seeds,
    );

    token::transfer(transfer_ctx, milestone.amount)?;

    milestone.status = MilestoneStatus::Released;

    if project.current_milestone >= project.milestone_count {
        project.status = ProjectStatus::Completed;
    } else {
        project.current_milestone = project
            .current_milestone
            .checked_add(1)
            .ok_or(error!(ResearchEscrowError::MathOverflow))?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub project: Account<'info, ResearchProject>,

    #[account(
        mut,
        seeds = [
            b"escrow",
            project.key().as_ref()
        ],
        bump = escrow_vault.bump,
        constraint = escrow_vault.project == project.key() @ ResearchEscrowError::InvalidEscrowVault
    )]
    pub escrow_vault: Account<'info, EscrowVault>,

    #[account(
        mut,
        seeds = [
            b"milestone",
            project.key().as_ref(),
            project.current_milestone.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(
        mut,
        constraint = escrow_token_account.key() == project.escrow_token_account @ ResearchEscrowError::InvalidTokenAccount,
        constraint = escrow_token_account.mint == project.usdc_mint @ ResearchEscrowError::InvalidTokenAccount
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = researcher_token_account.owner == owner.key() @ ResearchEscrowError::InvalidTokenAccount,
        constraint = researcher_token_account.mint == project.usdc_mint @ ResearchEscrowError::InvalidTokenAccount
    )]
    pub researcher_token_account: Account<'info, TokenAccount>,

    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}
