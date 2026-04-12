import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { corsOptions } from './config/cors';
import { attachAuthContext } from './middleware/auth.middleware';
import { globalErrorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';
import { createRateLimiter } from './middleware/rate-limiter.middleware';
import { requestLogger } from './middleware/request-logger';
import { applySecurityMiddleware } from './middleware/security';
import { apiRouter } from './routes';

export const createApp = (): express.Express => {
  const app = express();
  const webRootPath = path.join(__dirname, '../public/browser');
  const webIndexPath = path.join(webRootPath, 'index.html');

  applySecurityMiddleware(app);
  app.use(cors(corsOptions));
  app.use(requestLogger);
  app.use(createRateLimiter());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(attachAuthContext);
  app.use('/ProductImages', express.static(path.join(process.cwd(), 'ProductImages')));

  app.use('/api', apiRouter);

  if (fs.existsSync(webRootPath)) {
    app.use(express.static(webRootPath));

    app.get(/^\/(?!api|uploads).*/, (req, res, next) => {
      if (req.method !== 'GET') {
        next();
        return;
      }

      if (fs.existsSync(webIndexPath)) {
        res.sendFile(webIndexPath);
        return;
      }

      next();
    });
  }

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
