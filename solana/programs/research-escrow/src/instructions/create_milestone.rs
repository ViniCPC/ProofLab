use anchor_lang::prelude::*;

use crate::{Milestone, MilestoneStatus, ProjectStatus, ResearchEscrowError, ResearchProject};

fn next_milestone_total(current_total: u64, amount: u64, project_total: u64) -> Result<u64> {
    let next_total = current_total
        .checked_add(amount)
        .ok_or(error!(ResearchEscrowError::MathOverflow))?;

    require!(
        next_total <= project_total,
        ResearchEscrowError::MilestoneAmountTooHigh
    );

    Ok(next_total)
}

pub fn handler(
    ctx: Context<CreateMilestone>,
    order: u64,
    amount: u64,
    deadline: i64,
) -> Result<()> {
    require!(amount > 0, ResearchEscrowError::InvalidAmount);
    require!(deadline > 0, ResearchEscrowError::InvalidDeadline);

    let project = &mut ctx.accounts.project;

    require!(
        project.status == ProjectStatus::Funding,
        ResearchEscrowError::ProjectNotFunding
    );

    require!(
        amount <= project.total_amount,
        ResearchEscrowError::MilestoneAmountTooHigh
    );

    let milestone_amount_total =
        next_milestone_total(project.milestone_amount_total, amount, project.total_amount)?;

    let expected_order = project
        .milestone_count
        .checked_add(1)
        .ok_or(error!(ResearchEscrowError::MathOverflow))?;

    require!(
        order == expected_order,
        ResearchEscrowError::InvalidMilestoneOrder
    );

    let milestone = &mut ctx.accounts.milestone;

    milestone.project = project.key();
    milestone.order = order;
    milestone.amount = amount;
    milestone.status = MilestoneStatus::Created;
    milestone.votes_yes = 0;
    milestone.votes_no = 0;
    milestone.deadline = deadline;

    project.milestone_count = expected_order;
    project.milestone_amount_total = milestone_amount_total;

    Ok(())
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

#[cfg(test)]
mod tests {
    use super::next_milestone_total;

    #[test]
    fn milestone_totals_cannot_exceed_project_total() {
        assert!(next_milestone_total(60, 41, 100).is_err());
        assert_eq!(next_milestone_total(60, 40, 100).unwrap(), 100);
    }
}
