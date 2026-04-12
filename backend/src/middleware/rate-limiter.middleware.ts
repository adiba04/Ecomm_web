import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

interface RateLimitBucket {
  count: number;
  windowStart: number;
}

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
}

export const createRateLimiter = (options?: RateLimiterOptions) => {
  const windowMs = options?.windowMs ?? env.rateLimitWindowMs;
  const maxRequests = options?.maxRequests ?? env.rateLimitMaxRequests;
  const buckets = new Map<string, RateLimitBucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const bucket = buckets.get(key);

    if (!bucket || now - bucket.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      next();
      return;
    }

    if (bucket.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - bucket.windowStart)) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later.'
      });
      return;
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    next();
  };
};
