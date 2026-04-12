import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { env } from './env';

fs.mkdirSync(path.dirname(env.db.path), { recursive: true });

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: env.db.path,
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
  synchronize: env.db.synchronize,
  logging: env.nodeEnv === 'development',
  prepareDatabase: (database) => {
    database.pragma(`journal_mode = ${env.db.journalMode}`);
  }
});
