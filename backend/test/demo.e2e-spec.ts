import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DemoAdminGuard } from '../src/demo/demo-admin.guard';
import { DemoController } from '../src/demo/demo.controller';
import { DemoService } from '../src/demo/demo.service';

describe('Demo access (e2e)', () => {
  let app: INestApplication<App>;
  const token = 'private-demo-admin-token';
  const summary = { projects: [], primaryProjectId: 'demo-project' };
  const demoService = {
    getSummary: jest.fn().mockResolvedValue(summary),
    seed: jest.fn().mockResolvedValue(summary),
    applyScenario: jest.fn().mockResolvedValue(summary),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [DemoController],
      providers: [
        DemoAdminGuard,
        { provide: DemoService, useValue: demoService },
        {
          provide: ConfigService,
          useValue: new ConfigService({
            NODE_ENV: 'production',
            DEMO_ADMIN_TOKEN: token,
          }),
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => app.close());

  it('keeps the demo summary public and read-only', async () => {
    await request(app.getHttpServer())
      .get('/demo')
      .expect(200)
      .expect({ ...summary, mutationsEnabled: false });
  });

  it.each(['/demo/seed', '/demo/scenario'])(
    'rejects unauthenticated changes to %s before accessing the database',
    async (path) => {
      await request(app.getHttpServer())
        .post(path)
        .send({ scenario: 'funding' })
        .expect(401);

      expect(demoService.seed).not.toHaveBeenCalled();
      expect(demoService.applyScenario).not.toHaveBeenCalled();
    },
  );

  it('allows an administrator to seed the demo', async () => {
    await request(app.getHttpServer())
      .post('/demo/seed')
      .set('x-demo-admin-token', token)
      .expect(201)
      .expect({ ...summary, mutationsEnabled: false });

    expect(demoService.seed).toHaveBeenCalledTimes(1);
  });

  it('allows an administrator to change the scenario', async () => {
    await request(app.getHttpServer())
      .post('/demo/scenario')
      .set('x-demo-admin-token', token)
      .send({ scenario: 'funding' })
      .expect(201);

    expect(demoService.applyScenario).toHaveBeenCalledWith('funding');
  });
});
