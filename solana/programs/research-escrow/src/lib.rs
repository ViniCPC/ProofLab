use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("5q7tMMX6j5M4m6JQ2R4kGPZZ8sJ5bxFcxwJkmxfW4AcJ");

#[program]
pub mod research_escrow {
    use super::*;

    pub fn create_project(
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
        project.current_milestone = 0;
        project.status = ProjectStatus::Funding;
        project.escrow_vault = escrow_vault.key();
        project.usdc_mint = ctx.accounts.usdc_mint.key();
        project.escrow_token_account = ctx.accounts.escrow_token_account.key();
        project.bump = ctx.bumps.project;

        escrow_vault.project = project.key();
        escrow_vault.bump = ctx.bumps.escrow_vault;

        Ok(())
    }

    pub fn create_milestone(
        ctx: Context<CreateMilestone>,
        order: u64,
        amount: u64,
        deadline: i64,
    ) -> Result<()> {
        require!(amount > 0, ResearchEscrowError::InvalidAmount);
        require!(deadline > 0, ResearchEscrowError::InvalidDeadline);

        let project = &ctx.accounts.project;

        require!(
            amount <= project.total_amount,
            ResearchEscrowError::MilestoneAmountTooHigh
        );

        let milestone = &mut ctx.accounts.milestone;

        milestone.project = project.key();
        milestone.order = order;
        milestone.amount = amount;
        milestone.status = MilestoneStatus::Created;
        milestone.votes_yes = 0;
        milestone.votes_no = 0;
        milestone.deadline = deadline;

        Ok(())
    }

    pub fn fund_project(ctx: Context<FundProject>, amount: u64) -> Result<()> {
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
            ctx.accounts.token_program.key(),
            transfer_accounts,
        );

        token::transfer(transfer_ctx, amount)?;

        let contribution = &mut ctx.accounts.contribution;

        if contribution.amount == 0 {
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

    pub fn submit_milestone(
        ctx: Context<SubmitMilestone>,
        voting_duration_seconds: i64,
    ) -> Result<()> {
        require!(
            voting_duration_seconds > 0,
            ResearchEscrowError::InvalidVotingDuration
        );

        let project = &ctx.accounts.project;

        require!(
            project.status == ProjectStatus::Active,
            ResearchEscrowError::ProjectNotActive
        );

        let milestone = &mut ctx.accounts.milestone;

        require!(
            milestone.project == project.key(),
            ResearchEscrowError::InvalidMilestoneProject
        );

        require!(
            milestone.order == project.current_milestone,
            ResearchEscrowError::InvalidCurrentMilestone
        );

        require!(
            milestone.status == MilestoneStatus::Created
                || milestone.status == MilestoneStatus::Rejected,
            ResearchEscrowError::MilestoneCannotBeSubmitted
        );

        let now = Clock::get()?.unix_timestamp;

        milestone.status = MilestoneStatus::PendingReview;
        milestone.votes_yes = 0;
        milestone.votes_no = 0;
        milestone.deadline = now
            .checked_add(voting_duration_seconds)
            .ok_or(error!(ResearchEscrowError::MathOverflow))?;

        Ok(())
    }

    pub fn vote_milestone(
        ctx: Context<VoteMilestone>,
        approve: bool,
    ) -> Result<()> {
        let project = &ctx.accounts.project;
        let milestone = &mut ctx.accounts.milestone;
        let contribution = &ctx.accounts.contribution;
        let vote = &mut ctx.accounts.vote;

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
            milestone.status == MilestoneStatus::PendingReview,
            ResearchEscrowError::MilestoneNotInReview
        );

        let now = Clock::get()?.unix_timestamp;

        require!(
            now <= milestone.deadline,
            ResearchEscrowError::VotingPeriodClosed
        );

        require!(
            contribution.project == project.key(),
            ResearchEscrowError::InvalidContributionProject
        );

        require!(
            contribution.contributor == ctx.accounts.voter.key(),
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

        let vote_weight = contribution.amount;

        vote.project = project.key();
        vote.milestone = milestone.key();
        vote.voter = ctx.accounts.voter.key();
        vote.approve = approve;
        vote.weight = vote_weight;
        vote.bump = ctx.bumps.vote;

        if approve {
            milestone.votes_yes = milestone
                .votes_yes
                .checked_add(vote_weight)
                .ok_or(error!(ResearchEscrowError::MathOverflow))?;
        } else {
            milestone.votes_no = milestone
                .votes_no
                .checked_add(vote_weight)
                .ok_or(error!(ResearchEscrowError::MathOverflow))?;
        }

        Ok(())
    }

    pub fn finalize_milestone_vote(ctx: Context<FinalizeMilestoneVote>) -> Result<()> {
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
            milestone.status == MilestoneStatus::PendingReview,
            ResearchEscrowError::MilestoneNotInReview
        );

        let now = Clock::get()?.unix_timestamp;

        require!(
            now > milestone.deadline,
            ResearchEscrowError::VotingPeriodStillOpen
        );

        if milestone.votes_yes > milestone.votes_no {
            milestone.status = MilestoneStatus::Approved;
        } else {
            milestone.status = MilestoneStatus::Rejected;
            project.status = ProjectStatus::Cancelled;
        }

        Ok(())
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
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
            ctx.accounts.token_program.key(),
            transfer_accounts,
            signer_seeds,
        );

        token::transfer(transfer_ctx, milestone.amount)?;

        milestone.status = MilestoneStatus::Released;

        project.current_milestone = project
            .current_milestone
            .checked_add(1)
            .ok_or(error!(ResearchEscrowError::MathOverflow))?;

        Ok(())
    }

    pub fn cancel_project(ctx: Context<CancelProject>) -> Result<()> {
        let project = &mut ctx.accounts.project;

        require!(
            project.status != ProjectStatus::Completed,
            ResearchEscrowError::ProjectAlreadyCompleted
        );

        require!(
            project.status != ProjectStatus::Cancelled,
            ResearchEscrowError::ProjectAlreadyCancelled
        );

        project.status = ProjectStatus::Cancelled;

        Ok(())
    }

    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
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

        require!(
            project.funded_amount > 0,
            ResearchEscrowError::InvalidAmount
        );

        let escrow_balance = ctx.accounts.escrow_token_account.amount;

        require!(
            escrow_balance > 0,
            ResearchEscrowError::RefundUnavailable
        );

        let refund_amount = (contribution.amount as u128)
            .checked_mul(escrow_balance as u128)
            .ok_or(error!(ResearchEscrowError::MathOverflow))?
            .checked_div(project.funded_amount as u128)
            .ok_or(error!(ResearchEscrowError::MathOverflow))? as u64;

        require!(
            refund_amount > 0,
            ResearchEscrowError::RefundUnavailable
        );

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
            ctx.accounts.token_program.key(),
            transfer_accounts,
            signer_seeds,
        );

        token::transfer(transfer_ctx, refund_amount)?;

        contribution.refunded = true;

        Ok(())
    }
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

#[derive(Accounts)]
#[instruction(order: u64)]
pub struct CreateMilestone<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub project: Account<'info, ResearchProject>,

    #[account(
        init,
        payer = owner,
        space = Milestone::SPACE,
        seeds = [
            b"milestone",
            project.key().as_ref(),
            order.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub milestone: Account<'info, Milestone>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
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

#[derive(Accounts)]
pub struct SubmitMilestone<'info> {
    #[account(
        has_one = owner
    )]
    pub project: Account<'info, ResearchProject>,

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

    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct VoteMilestone<'info> {
    pub project: Account<'info, ResearchProject>,

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
        seeds = [
            b"contribution",
            project.key().as_ref(),
            voter.key().as_ref()
        ],
        bump = contribution.bump
    )]
    pub contribution: Account<'info, Contribution>,

    #[account(
        init,
        payer = voter,
        space = Vote::SPACE,
        seeds = [
            b"vote",
            milestone.key().as_ref(),
            voter.key().as_ref()
        ],
        bump
    )]
    pub vote: Account<'info, Vote>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeMilestoneVote<'info> {
    #[account(mut)]
    pub project: Account<'info, ResearchProject>,

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

#[derive(Accounts)]
pub struct CancelProject<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub project: Account<'info, ResearchProject>,

    pub owner: Signer<'info>,
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

#[account]
pub struct ResearchProject {
    pub owner: Pubkey,
    pub title: String,
    pub total_amount: u64,
    pub funded_amount: u64,
    pub current_milestone: u64,
    pub status: ProjectStatus,
    pub escrow_vault: Pubkey,
    pub usdc_mint: Pubkey,
    pub escrow_token_account: Pubkey,
    pub bump: u8,
}

impl ResearchProject {
    pub const MAX_TITLE_LEN: usize = 64;

    pub const SPACE: usize =
        8 +
        32 +
        4 + Self::MAX_TITLE_LEN +
        8 +
        8 +
        8 +
        1 +
        32 +
        32 +
        32 +
        1;
}

#[account]
pub struct EscrowVault {
    pub project: Pubkey,
    pub bump: u8,
}

impl EscrowVault {
    pub const SPACE: usize =
        8 +
        32 +
        1;
}

#[account]
pub struct Milestone {
    pub project: Pubkey,
    pub order: u64,
    pub amount: u64,
    pub status: MilestoneStatus,
    pub votes_yes: u64,
    pub votes_no: u64,
    pub deadline: i64,
}

impl Milestone {
    pub const SPACE: usize =
        8 +
        32 +
        8 +
        8 +
        1 +
        8 +
        8 +
        8;
}

#[account]
pub struct Contribution {
    pub project: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub refunded: bool,
    pub bump: u8,
}

impl Contribution {
    pub const SPACE: usize =
        8 +
        32 +
        32 +
        8 +
        1 +
        1;
}

#[account]
pub struct Vote {
    pub project: Pubkey,
    pub milestone: Pubkey,
    pub voter: Pubkey,
    pub approve: bool,
    pub weight: u64,
    pub bump: u8,
}

impl Vote {
    pub const SPACE: usize =
        8 +
        32 +
        32 +
        32 +
        1 +
        8 +
        1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ProjectStatus {
    Funding,
    Active,
    Completed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MilestoneStatus {
    Created,
    PendingReview,
    Approved,
    Rejected,
    Released,
}

#[error_code]
pub enum ResearchEscrowError {
    #[msg("The project title is too long.")]
    TitleTooLong,

    #[msg("The amount must be greater than zero.")]
    InvalidAmount,

    #[msg("The milestone deadline is invalid.")]
    InvalidDeadline,

    #[msg("The milestone amount is greater than the project total amount.")]
    MilestoneAmountTooHigh,

    #[msg("The project is not accepting funding.")]
    ProjectNotFunding,

    #[msg("The project is not active.")]
    ProjectNotActive,

    #[msg("Invalid contribution project.")]
    InvalidContributionProject,

    #[msg("Invalid contribution owner.")]
    InvalidContributionOwner,

    #[msg("This contribution was already refunded.")]
    ContributionAlreadyRefunded,

    #[msg("Invalid token account.")]
    InvalidTokenAccount,

    #[msg("Invalid milestone project.")]
    InvalidMilestoneProject,

    #[msg("Invalid current milestone.")]
    InvalidCurrentMilestone,

    #[msg("This milestone cannot be submitted for review.")]
    MilestoneCannotBeSubmitted,

    #[msg("This milestone is not in review.")]
    MilestoneNotInReview,

    #[msg("The voting period is closed.")]
    VotingPeriodClosed,

    #[msg("The voting period is still open.")]
    VotingPeriodStillOpen,

    #[msg("Invalid voting duration.")]
    InvalidVotingDuration,

    #[msg("Only contributors can vote.")]
    NotAContributor,

    #[msg("The milestone was not approved.")]
    MilestoneNotApproved,

    #[msg("Insufficient escrow balance.")]
    InsufficientEscrowBalance,

    #[msg("The project is not cancelled.")]
    ProjectNotCancelled,

    #[msg("The project is already completed.")]
    ProjectAlreadyCompleted,

    #[msg("The project is already cancelled.")]
    ProjectAlreadyCancelled,

    #[msg("Invalid escrow vault.")]
    InvalidEscrowVault,

    #[msg("There is no refund available.")]
    RefundUnavailable,

    #[msg("Math overflow.")]
    MathOverflow,
}