use anchor_lang::prelude::*;

#[account]
pub struct ResearchProject {
    pub owner: Pubkey,
    pub title: String,
    pub total_amount: u64,
    pub funded_amount: u64,
    pub current_milestone: u64,
    pub milestone_count: u64,
    pub status: ProjectStatus,
    pub escrow_vault: Pubkey,
    pub usdc_mint: Pubkey,
    pub escrow_token_account: Pubkey,
    pub bump: u8,
}

impl ResearchProject {
    pub const MAX_TITLE_LEN: usize = crate::constants::MAX_TITLE_LEN;
    pub const SPACE: usize = crate::constants::RESEARCH_PROJECT_SPACE;
}

#[account]
pub struct EscrowVault {
    pub project: Pubkey,
    pub bump: u8,
}

impl EscrowVault {
    pub const SPACE: usize = crate::constants::ESCROW_VAULT_SPACE;
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
    pub const SPACE: usize = crate::constants::MILESTONE_SPACE;
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
    pub const SPACE: usize = crate::constants::CONTRIBUTION_SPACE;
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
    pub const SPACE: usize = crate::constants::VOTE_SPACE;
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
