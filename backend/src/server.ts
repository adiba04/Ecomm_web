import { createApp } from './app';
import { AppDataSource } from './config/data-source';
import { env } from './config/env';
import { ensureAdminSeed } from './seeds/admin.seed';
import { runDemoDataSeed } from './seeds/demo-data.seed';

const startHttpServer = (): void => {
  const app = createApp();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${env.port}`);
  });
};

const bootstrap = async (): Promise<void> => {
  try {
    if (env.db.required) {
      await AppDataSource.initialize();
      await ensureAdminSeed();
      await runDemoDataSeed();
      // eslint-disable-next-line no-console
      console.log('Database connected');
    } else {
      try {
        await AppDataSource.initialize();
        await ensureAdminSeed();
        await runDemoDataSeed();
        // eslint-disable-next-line no-console
        console.log('Database connected');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Database not available, continuing without DB connection');
        // eslint-disable-next-line no-console
        console.warn(error);
      }
    }

    startHttpServer();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

void bootstrap();