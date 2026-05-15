use anchor_lang::prelude::*;

use crate::{
    Milestone, MilestoneStatus, ProjectStatus, ResearchEscrowError, ResearchProject,
};

pub fn handler(ctx: Context<SubmitMilestone>, voting_duration_seconds: i64) -> Result<()> {
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
