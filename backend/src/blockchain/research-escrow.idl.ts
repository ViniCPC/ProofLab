type Account<Name extends string> = {
  name: Name;
  writable?: boolean;
  signer?: boolean;
  address?: string;
  relations?: string[];
};

type Arg<Name extends string, Type extends string> = {
  name: Name;
  type: Type;
};

type Instruction<
  Name extends string,
  Accounts extends readonly Account<string>[],
  Args extends readonly Arg<string, string>[],
> = {
  name: Name;
  discriminator: number[];
  accounts: Accounts;
  args: Args;
};

export type ResearchEscrow = {
  address: string;
  metadata: {
    name: 'researchEscrow';
    version: string;
    spec: string;
    description?: string;
  };
  instructions: [
    Instruction<
      'createProject',
      [
        Account<'project'>,
        Account<'escrowVault'>,
        Account<'usdcMint'>,
        Account<'escrowTokenAccount'>,
        Account<'owner'>,
        Account<'tokenProgram'>,
        Account<'systemProgram'>,
      ],
      [
        Arg<'projectId', 'u64'>,
        Arg<'title', 'string'>,
        Arg<'totalAmount', 'u64'>,
      ]
    >,
    Instruction<
      'createMilestone',
      [
        Account<'project'>,
        Account<'milestone'>,
        Account<'owner'>,
        Account<'systemProgram'>,
      ],
      [Arg<'order', 'u64'>, Arg<'amount', 'u64'>, Arg<'deadline', 'i64'>]
    >,
    Instruction<
      'fundProject',
      [
        Account<'project'>,
        Account<'escrowVault'>,
        Account<'donorTokenAccount'>,
        Account<'escrowTokenAccount'>,
        Account<'contribution'>,
        Account<'contributor'>,
        Account<'tokenProgram'>,
        Account<'systemProgram'>,
      ],
      [Arg<'amount', 'u64'>]
    >,
    Instruction<
      'submitMilestone',
      [Account<'project'>, Account<'milestone'>, Account<'owner'>],
      [Arg<'votingDurationSeconds', 'i64'>]
    >,
    Instruction<
      'voteMilestone',
      [
        Account<'project'>,
        Account<'milestone'>,
        Account<'contribution'>,
        Account<'vote'>,
        Account<'voter'>,
        Account<'systemProgram'>,
      ],
      [Arg<'approve', 'bool'>]
    >,
    Instruction<
      'finalizeMilestoneVote',
      [Account<'project'>, Account<'milestone'>],
      []
    >,
    Instruction<
      'releaseFunds',
      [
        Account<'project'>,
        Account<'escrowVault'>,
        Account<'milestone'>,
        Account<'escrowTokenAccount'>,
        Account<'researcherTokenAccount'>,
        Account<'owner'>,
        Account<'tokenProgram'>,
      ],
      []
    >,
    Instruction<'cancelProject', [Account<'project'>, Account<'owner'>], []>,
    Instruction<
      'claimRefund',
      [
        Account<'project'>,
        Account<'escrowVault'>,
        Account<'contribution'>,
        Account<'escrowTokenAccount'>,
        Account<'donorTokenAccount'>,
        Account<'contributor'>,
        Account<'tokenProgram'>,
      ],
      []
    >,
  ];
  accounts: [
    {
      name: 'researchProject';
      discriminator: number[];
    },
  ];
  types: [
    {
      name: 'researchProject';
      type: {
        kind: 'struct';
        fields: [
          Arg<'owner', 'pubkey'>,
          Arg<'title', 'string'>,
          Arg<'totalAmount', 'u64'>,
          Arg<'fundedAmount', 'u64'>,
          Arg<'currentMilestone', 'u64'>,
          Arg<'milestoneCount', 'u64'>,
          {
            name: 'status';
            type: {
              defined: {
                name: 'projectStatus';
              };
            };
          },
          Arg<'escrowVault', 'pubkey'>,
          Arg<'usdcMint', 'pubkey'>,
          Arg<'escrowTokenAccount', 'pubkey'>,
          Arg<'bump', 'u8'>,
        ];
      };
    },
    {
      name: 'projectStatus';
      type: {
        kind: 'enum';
        variants: [
          { name: 'funding' },
          { name: 'active' },
          { name: 'completed' },
          { name: 'cancelled' },
        ];
      };
    },
  ];
};
