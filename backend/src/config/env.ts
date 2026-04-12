import dotenv from 'dotenv';

dotenv.config();

const required = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'] as const;
const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

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

if (dbRequired) {
  if (!dbUrl) {
    const hasHost = Boolean(process.env.DB_HOST ?? process.env.PGHOST ?? process.env.POSTGRES_HOST);
    const hasUser = Boolean(process.env.DB_USERNAME ?? process.env.PGUSER ?? process.env.POSTGRES_USER);
    const hasPassword = Boolean(process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD);
    const hasDatabase = Boolean(process.env.DB_NAME ?? process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE);

    if (!hasHost) {
      throw new Error(`Missing required environment variable: ${required[0]}`);
    }

    if (!hasUser) {
      throw new Error(`Missing required environment variable: ${required[1]}`);
    }

    if (!hasPassword) {
      throw new Error(`Missing required environment variable: ${required[2]}`);
    }

    if (!hasDatabase) {
      throw new Error(`Missing required environment variable: ${required[3]}`);
    }
  }
}

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
    url: dbUrl,
    host: process.env.DB_HOST ?? process.env.PGHOST ?? process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? process.env.PGPORT ?? 5432),
    username: process.env.DB_USERNAME ?? process.env.PGUSER ?? process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? '',
    database: process.env.DB_NAME ?? process.env.PGDATABASE ?? process.env.POSTGRES_DATABASE ?? 'ecom_db',
    ssl: toBoolean(process.env.DB_SSL, true),
    sslRejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false)
  }
};
