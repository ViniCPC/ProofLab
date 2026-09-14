export function validateEnvironment(config: Record<string, unknown>) {
  if (config.NODE_ENV !== 'production') {
    return config;
  }

  const errors: string[] = [];
  const databaseUrl = String(config.DATABASE_URL ?? '').trim();
  const jwtSecret = String(config.JWT_SECRET ?? '').trim();
  const frontendUrl = String(config.FRONTEND_URL ?? '').trim();

  try {
    const url = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
      throw new Error('Invalid database protocol');
    }
  } catch {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection URL');
  }

  if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must contain at least 32 characters');
  }

  try {
    const url = new URL(frontendUrl);
    if (url.protocol !== 'https:' || url.origin !== frontendUrl) {
      throw new Error('Invalid frontend origin');
    }
  } catch {
    errors.push(
      'FRONTEND_URL must be an exact HTTPS origin without a trailing slash or path',
    );
  }

  if (errors.length > 0) {
    throw new Error(`Invalid production environment:\n${errors.join('\n')}`);
  }

  return config;
}
