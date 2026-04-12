import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { env } from '../config/env';
import { User } from '../entities/user.entity';
import { sessionStore } from '../security/sessionStore';
import { ApiError } from '../utils/api-error';

const clearSessionCookie = (res: Response): void => {
  res.clearCookie(env.sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.secureCookies,
    signed: true
  });
};

const readSessionId = (req: Request): string | null => {
  const signed = req.signedCookies?.[env.sessionCookieName];
  const unsigned = req.cookies?.[env.sessionCookieName];
  const sessionId = signed ?? unsigned;

  return typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : null;
};

export const attachAuthContext = (req: Request, res: Response, next: NextFunction): void => {
  void (async () => {
    const sessionId = readSessionId(req);
    if (!sessionId) {
      next();
      return;
    }

    const session = sessionStore.touchSession(sessionId);
    if (!session) {
      clearSessionCookie(res);
      next();
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: session.userId },
      select: ['id', 'role', 'isLocked']
    });

    if (!user || user.isLocked) {
      sessionStore.revokeSession(sessionId);
      clearSessionCookie(res);
      next();
      return;
    }

    if (user.role !== session.role) {
      sessionStore.revokeSession(sessionId);
      clearSessionCookie(res);
      next();
      return;
    }

    req.sessionId = session.sessionId;
    req.auth = {
      userId: session.userId,
      role: session.role,
      sessionId: session.sessionId
    };

    next();
  })().catch(next);
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  next();
};

export const invalidateCurrentSession = (req: Request, res: Response): void => {
  if (req.sessionId) {
    sessionStore.revokeSession(req.sessionId);
  }
  clearSessionCookie(res);
};
