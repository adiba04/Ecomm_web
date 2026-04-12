import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const dbRequired = toBoolean(process.env.DB_REQUIRED, true);

const dbPath = process.env.DB_PATH ?? 'data/ecom.sqlite';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  port: Number(process.env.PORT ?? 4000),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  cookieSecret: process.env.COOKIE_SECRET ?? 'change-me',
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'sid',
  sessionTtlMinutes: toNumber(process.env.SESSION_TTL_MINUTES, 120),
  secureCookies: process.env.SECURE_COOKIES === 'true',
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMaxRequests: toNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 120),
  bcryptSaltRounds: toNumber(process.env.BCRYPT_SALT_ROUNDS, 12),
  passwordResetCodeTtlMinutes: toNumber(process.env.PASSWORD_RESET_CODE_TTL_MINUTES, 15),
  adminSeed: {
    enabled: toBoolean(process.env.ADMIN_SEED_ENABLED, true),
    fullName: process.env.ADMIN_SEED_FULL_NAME ?? 'System Admin',
    email: (process.env.ADMIN_SEED_EMAIL ?? 'admin@ecom.local').toLowerCase(),
    password: process.env.ADMIN_SEED_PASSWORD ?? 'Admin@1234'
  },
  db: {
    required: dbRequired,
    synchronize: toBoolean(process.env.DB_SYNCHRONIZE, (process.env.NODE_ENV ?? 'development') === 'development'),
    path: path.resolve(process.cwd(), dbPath),
    journalMode: process.env.DB_JOURNAL_MODE ?? 'WAL'
  }
};
