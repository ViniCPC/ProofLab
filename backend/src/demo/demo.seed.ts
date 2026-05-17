import { Prisma, PrismaClient } from '@prisma/client';

type DemoPrisma = Prisma.TransactionClient;

export const DEMO_PRIMARY_PROJECT_ID = '11111111-1111-4111-8111-111111111111';
export const DEMO_SECONDARY_PROJECT_ID = '22222222-2222-4222-8222-222222222222';
export const DEMO_DONOR_FLOW_PROJECT_ID =
  '55555555-5555-4555-8555-555555555555';
export const DEMO_PENDING_REVIEW_MILESTONE_ID =
  '33333333-3333-4333-8333-333333333331';
export const DEMO_DONOR_FLOW_MILESTONE_ID =
  '66666666-6666-4666-8666-666666666661';

export const demoScenarios = [
  'baseline',
  'funding',
  'pending-review',
  'approved',
  'cancelled',
  'completed',
] as const;

export type DemoScenario = (typeof demoScenarios)[number];

const users = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    name: 'Dra. Lina Azevedo',
    email: 'lina.azevedo@prooflab.demo',
    walletAddress: 'DemoResearcher111111111111111111111111111111',
    role: 'RESEARCHER' as const,
    reputation: 91,
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    name: 'Marcos Veras',
    email: 'marcos.veras@prooflab.demo',
    walletAddress: 'DemoFunder111111111111111111111111111111111',
    role: 'FUNDER' as const,
    reputation: 42,
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    name: 'Nadia Chen',
    email: 'nadia.chen@prooflab.demo',
    walletAddress: 'DemoFunder222222222222222222222222222222222',
    role: 'FUNDER' as const,
    reputation: 58,
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
    name: 'Olivia Hart',
    email: 'olivia.hart@prooflab.demo',
    walletAddress: 'DemoFunder333333333333333333333333333333333',
    role: 'FUNDER' as const,
    reputation: 37,
  },
];

const primaryMilestones = [
  {
    id: DEMO_PENDING_REVIEW_MILESTONE_ID,
    title: 'Protótipo microfluídico validado',
    description:
      'Construir e validar um chip de baixo custo capaz de separar biomarcadores em amostras clínicas simuladas.',
    amount: '40000.000000',
    order: 1,
    status: 'PENDING_REVIEW' as const,
    aiSummary:
      'A entrega mostra avanço consistente: o protótipo foi montado, os testes iniciais foram documentados e os riscos restantes estão ligados à repetibilidade em amostras reais.',
    consistencyScore: 88,
    completionEstimate: 82,
    aiRiskLevel: 'MEDIUM',
    submittedReport:
      'Protótipo v1 concluído com microcanais funcionais, validação em 120 amostras sintéticas e taxa de separação média de 91%.',
    submittedAt: new Date('2026-05-10T14:30:00.000Z'),
    onChainMilestoneAddress: null,
  },
  {
    id: '33333333-3333-4333-8333-333333333332',
    title: 'Estudo piloto com laboratório parceiro',
    description:
      'Executar um estudo piloto com laboratório parceiro para medir precisão, tempo por amostra e custo por análise.',
    amount: '50000.000000',
    order: 2,
    status: 'PENDING' as const,
    aiSummary: null,
    consistencyScore: null,
    completionEstimate: null,
    aiRiskLevel: null,
    submittedReport: null,
    submittedAt: null,
    onChainMilestoneAddress: null,
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Publicação aberta e dataset auditável',
    description:
      'Publicar paper, protocolo experimental e dataset anonimizado para revisão aberta da comunidade.',
    amount: '30000.000000',
    order: 3,
    status: 'PENDING' as const,
    aiSummary: null,
    consistencyScore: null,
    completionEstimate: null,
    aiRiskLevel: null,
    submittedReport: null,
    submittedAt: null,
    onChainMilestoneAddress: null,
  },
];

const secondaryMilestones = [
  {
    id: '44444444-4444-4444-8444-444444444441',
    title: 'Modelo de previsão climática local',
    description:
      'Treinar um modelo inicial para prever ilhas de calor em bairros urbanos usando sensores abertos.',
    amount: '35000.000000',
    order: 1,
    status: 'PENDING' as const,
  },
];

const donorFlowMilestones = [
  {
    id: DEMO_DONOR_FLOW_MILESTONE_ID,
    title: 'Relatório de bancada pronto para votação',
    description:
      'Validar os primeiros resultados do protocolo, incluindo fotos do setup, tabela de amostras e comparação com o plano aprovado.',
    amount: '15000.000000',
    order: 1,
    status: 'PENDING_REVIEW' as const,
    aiSummary:
      'A entrega está bem documentada para uma demo: o relatório descreve o setup, os resultados iniciais e os próximos riscos de validação. A IA recomenda votação comunitária antes de liberar a etapa.',
    consistencyScore: 86,
    completionEstimate: 81,
    aiRiskLevel: 'LOW',
    submittedReport:
      'Relatório v1 entregue com imagens do setup experimental, 48 amostras simuladas analisadas e tabela comparativa contra o protocolo inicial.',
    submittedAt: new Date('2026-05-12T16:00:00.000Z'),
    onChainMilestoneAddress: null,
  },
  {
    id: '66666666-6666-4666-8666-666666666662',
    title: 'Publicação dos dados de validação',
    description:
      'Publicar dataset anonimizado, protocolo revisado e resumo aberto para auditoria da comunidade.',
    amount: '10000.000000',
    order: 2,
    status: 'PENDING' as const,
  },
];

const primaryContributions = [
  {
    wallet: users[1].walletAddress,
    amount: '40000.000000',
    transactionHash: 'demo-tx-funding-001',
    onChainContributionAddress: 'DemoContribution1111111111111111111111111',
  },
  {
    wallet: users[2].walletAddress,
    amount: '35000.000000',
    transactionHash: 'demo-tx-funding-002',
    onChainContributionAddress: 'DemoContribution2222222222222222222222222',
  },
  {
    wallet: users[3].walletAddress,
    amount: '45000.000000',
    transactionHash: 'demo-tx-funding-003',
    onChainContributionAddress: 'DemoContribution3333333333333333333333333',
  },
];

async function clearDemoProjects(tx: DemoPrisma) {
  const demoProjectIds = [
    DEMO_PRIMARY_PROJECT_ID,
    DEMO_SECONDARY_PROJECT_ID,
    DEMO_DONOR_FLOW_PROJECT_ID,
  ];

  await tx.vote.deleteMany({
    where: { milestone: { projectId: { in: demoProjectIds } } },
  });
  await tx.contribution.deleteMany({
    where: { projectId: { in: demoProjectIds } },
  });
  await tx.milestone.deleteMany({
    where: { projectId: { in: demoProjectIds } },
  });
  await tx.researchProject.deleteMany({
    where: { id: { in: demoProjectIds } },
  });
}

async function upsertDemoUsers(tx: DemoPrisma) {
  for (const user of users) {
    await tx.user.upsert({
      where: { walletAddress: user.walletAddress },
      update: user,
      create: user,
    });
  }
}

async function createDemoProjects(tx: DemoPrisma) {
  await tx.researchProject.create({
    data: {
      id: DEMO_PRIMARY_PROJECT_ID,
      title: 'Lab-on-a-chip para diagnóstico rápido',
      description:
        'Pesquisa para criar um dispositivo microfluídico aberto que reduz custo e tempo de diagnóstico em regiões com baixa infraestrutura laboratorial.',
      totalAmount: '120000.000000',
      aiSummary:
        'Projeto com alto potencial de impacto social. A proposta tem metodologia clara, milestones verificáveis e risco técnico moderado por depender de validação laboratorial externa.',
      innovationScore: 91,
      feasibilityScore: 84,
      riskLevel: 'MEDIUM',
      complexityLevel: 'HIGH',
      status: 'ACTIVE',
      onChainProjectNonce: BigInt(101),
      onChainProjectAddress: 'DemoProjectPda111111111111111111111111111',
      escrowVaultAddress: 'DemoEscrowVault11111111111111111111111111',
      onChainStatus: 'Active',
      creatorId: users[0].id,
      milestones: {
        create: primaryMilestones,
      },
    },
  });

  await tx.researchProject.create({
    data: {
      id: DEMO_SECONDARY_PROJECT_ID,
      title: 'Sensores abertos para ilhas de calor',
      description:
        'Rede experimental de sensores urbanos para mapear variações de temperatura e gerar alertas comunitários em tempo quase real.',
      totalAmount: '85000.000000',
      aiSummary:
        'Pesquisa bem delimitada, com baixo risco regulatório e boa capacidade de validação pública. O principal desafio é manter qualidade dos sensores distribuídos.',
      innovationScore: 78,
      feasibilityScore: 89,
      riskLevel: 'LOW',
      complexityLevel: 'MEDIUM',
      status: 'ACTIVE',
      onChainProjectNonce: BigInt(202),
      onChainProjectAddress: 'DemoProjectPda222222222222222222222222222',
      escrowVaultAddress: 'DemoEscrowVault22222222222222222222222222',
      onChainStatus: 'Funding',
      creatorId: users[0].id,
      milestones: {
        create: secondaryMilestones,
      },
    },
  });

  await tx.researchProject.create({
    data: {
      id: DEMO_DONOR_FLOW_PROJECT_ID,
      title: 'Demo rápida para doação e voto',
      description:
        'Projeto preparado para gravar o fluxo do financiador: conecte sua wallet, faça uma contribuição mockada e vote na milestone em revisão.',
      totalAmount: '25000.000000',
      aiSummary:
        'Projeto de demonstração com escopo curto, baixo risco e milestone já pronta para revisão. Ideal para mostrar como um financiador entra, contribui e vota com apoio de análise da IA.',
      innovationScore: 74,
      feasibilityScore: 92,
      riskLevel: 'LOW',
      complexityLevel: 'LOW',
      status: 'ACTIVE',
      onChainProjectNonce: null,
      onChainProjectAddress: null,
      escrowVaultAddress: null,
      onChainStatus: null,
      creatorId: users[0].id,
      milestones: {
        create: donorFlowMilestones,
      },
    },
  });

  for (const contribution of primaryContributions) {
    await tx.contribution.create({
      data: {
        ...contribution,
        projectId: DEMO_PRIMARY_PROJECT_ID,
      },
    });
  }

  await seedPendingReviewVotes(tx, { approvedVotes: 2, rejectedVotes: 1 });
}

async function seedPendingReviewVotes(
  tx: DemoPrisma,
  summary: { approvedVotes: number; rejectedVotes: number },
) {
  await tx.vote.deleteMany({
    where: { milestoneId: DEMO_PENDING_REVIEW_MILESTONE_ID },
  });

  const votes = [
    ...users.slice(1, 1 + summary.approvedVotes).map((user) => ({
      voterWallet: user.walletAddress,
      approve: true,
    })),
    ...users
      .slice(
        1 + summary.approvedVotes,
        1 + summary.approvedVotes + summary.rejectedVotes,
      )
      .map((user) => ({
        voterWallet: user.walletAddress,
        approve: false,
      })),
  ];

  for (const vote of votes) {
    await tx.vote.create({
      data: {
        ...vote,
        milestoneId: DEMO_PENDING_REVIEW_MILESTONE_ID,
      },
    });
  }
}

export async function getDemoSummary(prisma: PrismaClient) {
  const projects = await prisma.researchProject.findMany({
    where: {
      id: {
        in: [
          DEMO_PRIMARY_PROJECT_ID,
          DEMO_SECONDARY_PROJECT_ID,
          DEMO_DONOR_FLOW_PROJECT_ID,
        ],
      },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      milestones: { orderBy: { order: 'asc' } },
      contributions: true,
      creator: {
        select: {
          id: true,
          name: true,
          walletAddress: true,
        },
      },
    },
  });

  return {
    primaryProjectId: DEMO_PRIMARY_PROJECT_ID,
    pendingReviewMilestoneId: DEMO_PENDING_REVIEW_MILESTONE_ID,
    projects: projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      totalAmount: project.totalAmount.toFixed(6),
      status: project.status,
      onChainStatus: project.onChainStatus,
      creator: project.creator,
      milestones: project.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        order: milestone.order,
        status: milestone.status,
      })),
      contributions: project.contributions.map((contribution) => ({
        id: contribution.id,
        amount: contribution.amount.toFixed(6),
        wallet: contribution.wallet,
      })),
    })),
  };
}

export async function seedDemoData(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    await clearDemoProjects(tx);
    await upsertDemoUsers(tx);
    await createDemoProjects(tx);
  });

  return getDemoSummary(prisma);
}

export async function applyDemoScenario(
  prisma: PrismaClient,
  scenario: DemoScenario,
) {
  if (scenario === 'baseline') {
    return seedDemoData(prisma);
  }

  await seedDemoData(prisma);

  if (scenario === 'funding') {
    await prisma.$transaction([
      prisma.vote.deleteMany({
        where: { milestoneId: DEMO_PENDING_REVIEW_MILESTONE_ID },
      }),
      prisma.milestone.update({
        where: { id: DEMO_PENDING_REVIEW_MILESTONE_ID },
        data: {
          status: 'PENDING',
          submittedReport: null,
          submittedAt: null,
          aiSummary: null,
          consistencyScore: null,
          completionEstimate: null,
          aiRiskLevel: null,
        },
      }),
    ]);
  }

  if (scenario === 'pending-review') {
    await prisma.milestone.update({
      where: { id: DEMO_PENDING_REVIEW_MILESTONE_ID },
      data: { status: 'PENDING_REVIEW' },
    });
  }

  if (scenario === 'approved') {
    await prisma.$transaction(async (tx) => {
      await tx.milestone.update({
        where: { id: DEMO_PENDING_REVIEW_MILESTONE_ID },
        data: { status: 'APPROVED' },
      });
      await seedPendingReviewVotes(tx, { approvedVotes: 3, rejectedVotes: 0 });
    });
  }

  if (scenario === 'cancelled') {
    await prisma.$transaction([
      prisma.researchProject.update({
        where: { id: DEMO_PRIMARY_PROJECT_ID },
        data: { status: 'CANCELLED', onChainStatus: 'Cancelled' },
      }),
      prisma.milestone.update({
        where: { id: DEMO_PENDING_REVIEW_MILESTONE_ID },
        data: { status: 'REJECTED' },
      }),
    ]);
  }

  if (scenario === 'completed') {
    await prisma.$transaction([
      prisma.researchProject.update({
        where: { id: DEMO_PRIMARY_PROJECT_ID },
        data: { status: 'COMPLETED', onChainStatus: 'Completed' },
      }),
      prisma.milestone.update({
        where: { id: DEMO_PENDING_REVIEW_MILESTONE_ID },
        data: {
          status: 'APPROVED',
          releaseTransactionHash: 'demo-release-tx-001',
        },
      }),
    ]);
  }

  return getDemoSummary(prisma);
}
