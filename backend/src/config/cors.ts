import { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (env.clientOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin is not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

