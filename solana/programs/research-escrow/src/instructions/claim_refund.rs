use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    Contribution, EscrowVault, ProjectStatus, ResearchEscrowError, ResearchProject,
};

pub fn handler(ctx: Context<ClaimRefund>) -> Result<()> {
    let project = &ctx.accounts.project;
    let contribution = &mut ctx.accounts.contribution;

    require!(
        project.status == ProjectStatus::Cancelled,
        ResearchEscrowError::ProjectNotCancelled
    );

    require!(
        contribution.project == project.key(),
        ResearchEscrowError::InvalidContributionProject
    );

    require!(
        contribution.contributor == ctx.accounts.contributor.key(),
        ResearchEscrowError::InvalidContributionOwner
    );

    require!(
        contribution.amount > 0,
        ResearchEscrowError::NotAContributor
    );

    require!(
        !contribution.refunded,
        ResearchEscrowError::ContributionAlreadyRefunded
    );

    require!(project.funded_amount > 0, ResearchEscrowError::InvalidAmount);

    let escrow_balance = ctx.accounts.escrow_token_account.amount;

    require!(escrow_balance > 0, ResearchEscrowError::RefundUnavailable);

    let refund_amount_u128 = (contribution.amount as u128)
        .checked_mul(escrow_balance as u128)
        .ok_or(error!(ResearchEscrowError::MathOverflow))?
        .checked_div(project.funded_amount as u128)
        .ok_or(error!(ResearchEscrowError::MathOverflow))?;

    let refund_amount = u64::try_from(refund_amount_u128)
        .map_err(|_| error!(ResearchEscrowError::MathOverflow))?;

    require!(refund_amount > 0, ResearchEscrowError::RefundUnavailable);

    let project_key = project.key();

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"escrow",
        project_key.as_ref(),
        &[ctx.accounts.escrow_vault.bump],
    ]];

    let transfer_accounts = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.donor_token_account.to_account_info(),
        authority: ctx.accounts.escrow_vault.to_account_info(),
    };

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        signer_seeds,
    );

    token::transfer(transfer_ctx, refund_amount)?;

    contribution.refunded = true;

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    pub project: Account<'info, ResearchProject>,

    #[account(
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
            b"contribution",
            project.key().as_ref(),
            contributor.key().as_ref()
        ],
        bump = contribution.bump
    )]
    pub contribution: Account<'info, Contribution>,

    #[account(
        mut,
        constraint = escrow_token_account.key() == project.escrow_token_account @ ResearchEscrowError::InvalidTokenAccount,
        constraint = escrow_token_account.mint == project.usdc_mint @ ResearchEscrowError::InvalidTokenAccount
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = donor_token_account.owner == contributor.key() @ ResearchEscrowError::InvalidTokenAccount,
        constraint = donor_token_account.mint == project.usdc_mint @ ResearchEscrowError::InvalidTokenAccount
    )]
    pub donor_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub contributor: Signer<'info>,

    pub token_program: Program<'info, Token>,
}
