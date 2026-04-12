import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Express } from 'express';
import { env } from '../config/env';

export const applySecurityMiddleware = (app: Express): void => {
  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false
    })
  );
  app.use(compression());
  app.use(cookieParser(env.cookieSecret));
};
