import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
};

// Guard: prevent weak default secrets in production
if (env.nodeEnv === 'production') {
  if (env.jwtAccessSecret === 'dev-access-secret' || env.jwtRefreshSecret === 'dev-refresh-secret') {
    throw new Error(
      '[SECURITY] JWT secrets are using default development values in production. ' +
      'Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your .env file.'
    );
  }
  if (!env.databaseUrl) {
    throw new Error('[SECURITY] DATABASE_URL is not set in production.');
  }
}
