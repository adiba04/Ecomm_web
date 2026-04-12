import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rate-limiter.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { authController } from './auth.controller';

const authRouter = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 60
});

const loginRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 20
});

authRouter.post('/register', authRateLimiter, authController.register);
authRouter.post('/login', loginRateLimiter, authController.login);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.post('/forgot-password', authRateLimiter, authController.forgotPassword);
authRouter.post('/reset-password', authRateLimiter, authController.resetPassword);
authRouter.get('/me', requireAuth, authController.me);
authRouter.patch('/me', requireAuth, authController.updateProfile);
authRouter.post('/change-password', requireAuth, authController.changePassword);
authRouter.patch('/lock/:userId', requireAuth, requireAdmin, authController.lockAccount);
authRouter.patch('/unlock/:userId', requireAuth, requireAdmin, authController.unlockAccount);

export { authRouter };
