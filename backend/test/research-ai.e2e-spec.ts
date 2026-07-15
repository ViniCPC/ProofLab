import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import nacl from 'tweetnacl';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  let value = 0n;
  for (const byte of bytes) {
    value = value * 256n + BigInt(byte);
  }

  let result = '';
  while (value > 0n) {
    const remainder = value % 58n;
    result = BASE58_ALPHABET[Number(remainder)] + result;
    value /= 58n;
  }

  for (const byte of bytes) {
    if (byte !== 0) break;
    result = '1' + result;
  }

  return result || '1';
}

function generateWallet() {
  const keypair = nacl.sign.keyPair();
  return {
    address: base58Encode(keypair.publicKey),
    secretKey: keypair.secretKey,
  };
}

const mockAnalysis = {
  summary: 'Resumo de teste gerado pelo mock da IA.',
  innovationScore: 82,
  feasibilityScore: 77,
  riskLevel: 'MEDIUM',
  complexityLevel: 'LOW',
  recommendation: 'Recomendação de teste gerada pelo mock da IA.',
};

function mockOpenAiSuccessOnce() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      status: 'completed',
      output_text: JSON.stringify(mockAnalysis),
    }),
    text: async () => '',
  } as Response);
}

function mockOpenAiFailureAlways() {
  (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));
}

async function loginWithFreshWallet(app: INestApplication<App>) {
  const wallet = generateWallet();
  const walletAddress = wallet.address;

  const nonceResponse = await request(app.getHttpServer())
    .post('/auth/nonce')
    .send({ walletAddress })
    .expect(201);

  const message: string = nonceResponse.body.message;
  const signature = nacl.sign.detached(
    new TextEncoder().encode(message),
    wallet.secretKey,
  );

  const loginResponse = await request(app.getHttpServer())
    .post('/auth/wallet-login')
    .send({
      walletAddress,
      signature: Buffer.from(signature).toString('base64'),
    })
    .expect(201);

  return {
    walletAddress,
    accessToken: loginResponse.body.accessToken as string,
  };
}

describe('Research creation AI analysis (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdProjectIds: string[] = [];
  const createdWallets: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(async () => {
    if (createdProjectIds.length) {
      await prisma.milestone.deleteMany({
        where: { projectId: { in: createdProjectIds } },
      });
      await prisma.researchProject.deleteMany({
        where: { id: { in: createdProjectIds } },
      });
    }
    if (createdWallets.length) {
      await prisma.user.deleteMany({
        where: { walletAddress: { in: createdWallets } },
      });
    }
    await app.close();
  });

  it('fills aiSummary, aiRecommendation and scores when OpenAI succeeds', async () => {
    const { walletAddress, accessToken } = await loginWithFreshWallet(app);
    createdWallets.push(walletAddress);
    mockOpenAiSuccessOnce();

    const response = await request(app.getHttpServer())
      .post('/research')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Pesquisa de teste e2e',
        description: 'Descrição de teste para o smoke test de IA.',
        totalAmount: '1000.000000',
      })
      .expect(201);

    createdProjectIds.push(response.body.id);

    expect(response.body.aiStatus).toBe('COMPLETED');
    expect(response.body.aiSummary).toBe(mockAnalysis.summary);
    expect(response.body.aiRecommendation).toBe(mockAnalysis.recommendation);
    expect(response.body.innovationScore).toBe(mockAnalysis.innovationScore);
    expect(response.body.feasibilityScore).toBe(mockAnalysis.feasibilityScore);
    expect(response.body.riskLevel).toBe(mockAnalysis.riskLevel);
    expect(response.body.complexityLevel).toBe(mockAnalysis.complexityLevel);

    const stored = await request(app.getHttpServer())
      .get(`/research/${response.body.id}`)
      .expect(200);

    expect(stored.body.aiStatus).toBe('COMPLETED');
    expect(stored.body.aiSummary).toBe(mockAnalysis.summary);
  });

  it('still saves the project when OpenAI fails, marking aiStatus as FAILED', async () => {
    const { walletAddress, accessToken } = await loginWithFreshWallet(app);
    createdWallets.push(walletAddress);
    mockOpenAiFailureAlways();

    const response = await request(app.getHttpServer())
      .post('/research')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Pesquisa de teste e2e (IA indisponível)',
        description: 'Descrição de teste para o fallback de IA.',
        totalAmount: '500.000000',
      })
      .expect(201);

    createdProjectIds.push(response.body.id);

    expect(response.body.aiStatus).toBe('FAILED');
    expect(response.body.aiSummary).toBeNull();
    expect(response.body.aiRecommendation).toBeNull();
    expect(response.body.innovationScore).toBeNull();

    const stored = await request(app.getHttpServer())
      .get(`/research/${response.body.id}`)
      .expect(200);

    expect(stored.body.id).toBe(response.body.id);
    expect(stored.body.aiStatus).toBe('FAILED');
  }, 15000);

  it('reanalyze re-runs the AI and updates a previously failed project', async () => {
    const { walletAddress, accessToken } = await loginWithFreshWallet(app);
    createdWallets.push(walletAddress);
    mockOpenAiFailureAlways();

    const created = await request(app.getHttpServer())
      .post('/research')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Pesquisa de teste e2e (reanalyze)',
        description: 'Descrição de teste para o botão de reanalyze.',
        totalAmount: '750.000000',
      })
      .expect(201);

    createdProjectIds.push(created.body.id);
    expect(created.body.aiStatus).toBe('FAILED');

    mockOpenAiSuccessOnce();

    const reanalyzed = await request(app.getHttpServer())
      .post(`/research/${created.body.id}/reanalyze`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    expect(reanalyzed.body.aiStatus).toBe('COMPLETED');
    expect(reanalyzed.body.aiSummary).toBe(mockAnalysis.summary);
  }, 15000);
});
