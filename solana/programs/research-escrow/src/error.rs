use anchor_lang::prelude::*;

#[error_code]
pub enum ResearchEscrowError {
    #[msg("The project title is too long.")]
    TitleTooLong,

    #[msg("The amount must be greater than zero.")]
    InvalidAmount,

    #[msg("The milestone deadline is invalid.")]
    InvalidDeadline,

    #[msg("The milestone order is not sequential.")]
    InvalidMilestoneOrder,

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
