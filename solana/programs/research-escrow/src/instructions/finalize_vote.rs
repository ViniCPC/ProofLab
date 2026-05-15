use anchor_lang::prelude::*;

use crate::{
    Milestone, MilestoneStatus, ProjectStatus, ResearchEscrowError, ResearchProject,
};

pub fn handler(ctx: Context<FinalizeMilestoneVote>) -> Result<()> {
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
