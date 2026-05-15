use anchor_lang::prelude::*;

use crate::{ProjectStatus, ResearchEscrowError, ResearchProject};

pub fn handler(ctx: Context<CancelProject>) -> Result<()> {
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

#[derive(Accounts)]
pub struct CancelProject<'info> {
    #[account(
        mut,
        has_one = owner
    )]
    pub project: Account<'info, ResearchProject>,

    pub owner: Signer<'info>,
}
