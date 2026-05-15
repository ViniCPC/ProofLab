use anchor_lang::prelude::*;

use crate::{Milestone, MilestoneStatus, ResearchEscrowError, ResearchProject};

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
        amount <= project.total_amount,
        ResearchEscrowError::MilestoneAmountTooHigh
    );

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
