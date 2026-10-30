import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AiClient } from '../src/ai/ai.client';
import { AiController } from '../src/ai/ai.controller';
import { AiService } from '../src/ai/ai.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { BlockchainService } from '../src/blockchain/blockchain.service';
import { MilestonesController } from '../src/milestones/milestones.controller';
import { MilestonesService } from '../src/milestones/milestones.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ResearchController } from '../src/research/research.controller';
import { ResearchService } from '../src/research/research.service';

describe('Missing AI key (e2e, isolated database)', () => {
  let app: INestApplication<App>;
  const user = { id: 'creator', walletAddress: 'test-wallet' };
  const prisma = {
    researchProject: {
      create: jest
        .fn()
        .mockImplementation(({ data }: { data: object }) =>
          Promise.resolve({ id: 'project', ...data }),
        ),
      findUnique: jest.fn().mockResolvedValue({
        id: 'project',
        creatorId: user.id,
        onChainProjectAddress: 'project-pda',
      }),
    },
    milestone: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'milestone',
        description: 'Experiment',
        status: 'PENDING',
      }),
      update: jest
        .fn()
        .mockImplementation(({ data }: { data: object }) =>
          Promise.resolve({ id: 'milestone', ...data }),
        ),
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])],
      controllers: [AiController, ResearchController, MilestonesController],
      providers: [
        AiClient,
        AiService,
        ResearchService,
        MilestonesService,
        { provide: ConfigService, useValue: { get: () => undefined } },
        { provide: PrismaService, useValue: prisma },
        {
          provide: BlockchainService,
          // A fully funded project: reports can only be sent once it is active.
          useValue: { getProjectStatus: jest.fn().mockResolvedValue('Active') },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest<{ user: typeof user }>().user =
            user;
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => app.close());
  afterEach(() => jest.restoreAllMocks());

  it('returns a usable availability response from the direct analysis route', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const response = await request(app.getHttpServer())
      .post('/ai/analyze-research')
      .send({
        title: 'Proposal',
        description: 'Research proposal',
        totalAmount: '1000',
      })
      .expect(201);

    expect(response.body.source).toBe('unavailable');
    expect(response.body.innovationScore).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('still persists a project without claiming completed AI analysis', async () => {
    const response = await request(app.getHttpServer())
      .post('/research')
      .send({
        title: 'Proposal',
        description: 'Research proposal',
        totalAmount: '1000',
        milestones: [
          {
            title: 'Experiment',
            description: 'Run the experiment',
            amount: '1000',
            order: 1,
          },
        ],
      })
      .expect(201);

    expect(response.body.aiStatus).toBe('FAILED');
    expect(response.body.aiSummary).toContain('indisponível');
    expect(response.body.innovationScore).toBeNull();
    expect(prisma.researchProject.create).toHaveBeenCalled();
  });

  it('keeps a submitted milestone waiting for the on-chain vote without invented scores', async () => {
    const response = await request(app.getHttpServer())
      .post('/research/project/milestones/milestone/submit-review')
      .send({
        submittedReport: 'Report',
        progress: 80,
        evidenceText: 'Results',
      })
      .expect(201);

    // Voting opens (PENDING_REVIEW) only after the on-chain submit.
    expect(response.body.status).toBe('SUBMITTED');
    expect(response.body.aiStatus).toBe('FAILED');
    expect(response.body.aiSummary).toContain('indisponível');
    expect(response.body.completionEstimate).toBeNull();
    expect(response.body.consistencyScore).toBeNull();
  });
});
