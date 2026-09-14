import { validateEnvironment } from './environment';

const productionConfig = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:password@db.example.com:5432/prooflab',
  JWT_SECRET: 'a'.repeat(32),
  FRONTEND_URL: 'https://prooflab.vercel.app',
};

describe('validateEnvironment', () => {
  it('allows a valid production configuration', () => {
    expect(validateEnvironment(productionConfig)).toBe(productionConfig);
  });

  it('does not impose production requirements on local development', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual({
      NODE_ENV: 'development',
    });
  });

  it.each([
    ['DATABASE_URL', undefined],
    ['DATABASE_URL', 'https://db.example.com'],
    ['JWT_SECRET', 'change-me'],
    ['FRONTEND_URL', 'http://localhost:5173'],
    ['FRONTEND_URL', 'https://prooflab.vercel.app/'],
    ['FRONTEND_URL', 'https://prooflab.vercel.app/demo'],
  ])('rejects an invalid %s', (key, value) => {
    expect(() =>
      validateEnvironment({ ...productionConfig, [key]: value }),
    ).toThrow(key);
  });
});
