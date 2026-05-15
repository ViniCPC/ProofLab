use anchor_lang::prelude::*;

use crate::{
    Contribution, Milestone, MilestoneStatus, ProjectStatus, ResearchEscrowError,
    ResearchProject, Vote,
};

pub fn handler(ctx: Context<VoteMilestone>, approve: bool) -> Result<()> {
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
