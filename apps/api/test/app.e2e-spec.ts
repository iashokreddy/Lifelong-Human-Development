import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end smoke test: boot the full Nest app and verify the public
 * curriculum endpoint serves the real content. No database or network required
 * (in-memory repositories and the deterministic AI stub are selected by default).
 */
describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/phases returns 200 with an entry whose id is phase-01', async () => {
    const response = await request(app.getHttpServer()).get('/api/phases').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((entry: { id: string }) => entry.id === 'phase-01')).toBe(true);
  });
});
