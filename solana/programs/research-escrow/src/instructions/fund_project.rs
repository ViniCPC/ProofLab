use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    Contribution, EscrowVault, ProjectStatus, ResearchEscrowError, ResearchProject,
};

pub fn handler(ctx: Context<FundProject>, amount: u64) -> Result<()> {
    require!(amount > 0, ResearchEscrowError::InvalidAmount);

    let project = &mut ctx.accounts.project;

    require!(
        project.status == ProjectStatus::Funding,
        ResearchEscrowError::ProjectNotFunding
    );

    let transfer_accounts = Transfer {
        from: ctx.accounts.donor_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.contributor.to_account_info(),
    };

    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );

    token::transfer(transfer_ctx, amount)?;

    let contribution = &mut ctx.accounts.contribution;

    if contribution.bump == 0 {
        contribution.project = project.key();
        contribution.contributor = ctx.accounts.contributor.key();
        contribution.amount = 0;
        contribution.refunded = false;
        contribution.bump = ctx.bumps.contribution;
    } else {
        require!(
            contribution.project == project.key(),
            ResearchEscrowError::InvalidContributionProject
        );

        require!(
            contribution.contributor == ctx.accounts.contributor.key(),
            ResearchEscrowError::InvalidContributionOwner
        );

        require!(
            !contribution.refunded,
            ResearchEscrowError::ContributionAlreadyRefunded
        );
    }

    contribution.amount = contribution
        .amount
        .checked_add(amount)
        .ok_or(error!(ResearchEscrowError::MathOverflow))?;

    project.funded_amount = project
        .funded_amount
        .checked_add(amount)
        .ok_or(error!(ResearchEscrowError::MathOverflow))?;

    if project.funded_amount >= project.total_amount {
        project.status = ProjectStatus::Active;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct FundProject<'info> {
    #[account(mut)]
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
        constraint = donor_token_account.owner == contributor.key() @ ResearchEscrowError::InvalidTokenAccount,
        constraint = donor_token_account.mint == project.usdc_mint @ ResearchEscrowError::InvalidTokenAccount
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = escrow_token_account.key() == project.escrow_token_account @ ResearchEscrowError::InvalidTokenAccount,
        constraint = escrow_token_account.mint == project.usdc_mint @ ResearchEscrowError::InvalidTokenAccount
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = Contribution::SPACE,
        seeds = [
            b"contribution",
            project.key().as_ref(),
            contributor.key().as_ref()
        ],
        bump
    )]
    pub contribution: Account<'info, Contribution>,

    #[account(mut)]
    pub contributor: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
