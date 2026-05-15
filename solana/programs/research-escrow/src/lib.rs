use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("5q7tMMX6j5M4m6JQ2R4kGPZZ8sJ5bxFcxwJkmxfW4AcJ");

#[program]
pub mod research_escrow {
    use super::*;

    pub fn create_project(
        ctx: Context<CreateProject>,
        project_id: u64,
        title: String,
        total_amount: u64,
    ) -> Result<()> {
        crate::instructions::create_project::handler(
            ctx,
            project_id,
            title,
            total_amount,
        )
    }

    pub fn create_milestone(
        ctx: Context<CreateMilestone>,
        order: u64,
        amount: u64,
        deadline: i64,
    ) -> Result<()> {
        crate::instructions::create_milestone::handler(ctx, order, amount, deadline)
    }

    pub fn fund_project(ctx: Context<FundProject>, amount: u64) -> Result<()> {
        crate::instructions::fund_project::handler(ctx, amount)
    }

    pub fn submit_milestone(
        ctx: Context<SubmitMilestone>,
        voting_duration_seconds: i64,
    ) -> Result<()> {
        crate::instructions::submit_milestone::handler(ctx, voting_duration_seconds)
    }

    pub fn vote_milestone(ctx: Context<VoteMilestone>, approve: bool) -> Result<()> {
        crate::instructions::vote_milestone::handler(ctx, approve)
    }

    pub fn finalize_milestone_vote(ctx: Context<FinalizeMilestoneVote>) -> Result<()> {
        crate::instructions::finalize_vote::handler(ctx)
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        crate::instructions::release_funds::handler(ctx)
    }

    pub fn cancel_project(ctx: Context<CancelProject>) -> Result<()> {
        crate::instructions::cancel_project::handler(ctx)
    }

    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        crate::instructions::claim_refund::handler(ctx)
    }
}
