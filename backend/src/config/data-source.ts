import 'reflect-metadata';
import path from 'path';
import { DataSource } from 'typeorm';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.db.url,
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
  synchronize: env.db.synchronize,
  logging: env.nodeEnv === 'development',
  ssl: env.db.ssl
    ? {
        rejectUnauthorized: env.db.sslRejectUnauthorized
      }
    : false
});
