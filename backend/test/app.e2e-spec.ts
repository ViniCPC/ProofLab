import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureSwagger } from '../src/docs/swagger';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureSwagger(app);
    await app.init();
  });

  afterEach(async () => app.close());

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ message: 'ProofLab API is running' });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/docs/ (GET) serves the Swagger UI', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs/')
      .expect(200);
    expect(response.text).toContain('swagger-ui');
  });

  it('/docs-json (GET) describes payloads and authentication', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    const document = response.body;
    expect(document.info.title).toBe('ProofLab API');
    expect(document.paths['/health'].get.security).toBeUndefined();
    expect(document.paths['/research'].get.security).toBeUndefined();
    expect(document.paths['/research'].post.security).toEqual([
      { 'wallet-jwt': [] },
    ]);
    expect(document.paths['/demo/seed'].post.security).toEqual([
      { 'demo-admin': [] },
    ]);
    expect(document.components.schemas.CreateResearchDto.required).toEqual(
      expect.arrayContaining(['title', 'description', 'totalAmount']),
    );
    expect(
      document.components.schemas.CreateResearchDto.properties.milestones.items
        .$ref,
    ).toContain('CreateMilestoneDto');
    expect(
      document.components.schemas.ApplyDemoScenarioDto.properties.scenario.enum,
    ).toContain('funding');
    expect(document.paths['/auth/nonce']).toBeDefined();
    expect(document.paths['/ai/analyze-research'].post.security).toEqual([
      { 'wallet-jwt': [] },
    ]);
    expect(
      document.components.schemas.ResearchAnalysisResponseDto.properties
        .innovationScore.nullable,
    ).toBe(true);
  });
});
