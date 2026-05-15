pub const DISCRIMINATOR_SIZE: usize = 8;
pub const PUBKEY_SIZE: usize = 32;
pub const STRING_PREFIX_SIZE: usize = 4;
pub const U64_SIZE: usize = 8;
pub const I64_SIZE: usize = 8;
pub const BOOL_SIZE: usize = 1;
pub const U8_SIZE: usize = 1;
pub const ENUM_SIZE: usize = 1;

pub const MAX_TITLE_LEN: usize = 64;

pub const RESEARCH_PROJECT_SPACE: usize = DISCRIMINATOR_SIZE
    + PUBKEY_SIZE
    + STRING_PREFIX_SIZE
    + MAX_TITLE_LEN
    + U64_SIZE
    + U64_SIZE
    + U64_SIZE
    + U64_SIZE
    + ENUM_SIZE
    + PUBKEY_SIZE
    + PUBKEY_SIZE
    + PUBKEY_SIZE
    + U8_SIZE;

pub const ESCROW_VAULT_SPACE: usize = DISCRIMINATOR_SIZE + PUBKEY_SIZE + U8_SIZE;

pub const MILESTONE_SPACE: usize = DISCRIMINATOR_SIZE
    + PUBKEY_SIZE
    + U64_SIZE
    + U64_SIZE
    + ENUM_SIZE
    + U64_SIZE
    + U64_SIZE
    + I64_SIZE;

pub const CONTRIBUTION_SPACE: usize = DISCRIMINATOR_SIZE
    + PUBKEY_SIZE
    + PUBKEY_SIZE
    + U64_SIZE
    + BOOL_SIZE
    + U8_SIZE;

pub const VOTE_SPACE: usize = DISCRIMINATOR_SIZE
    + PUBKEY_SIZE
    + PUBKEY_SIZE
    + PUBKEY_SIZE
    + BOOL_SIZE
    + U64_SIZE
    + U8_SIZE;
