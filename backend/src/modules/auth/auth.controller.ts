import { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';
import { invalidateCurrentSession } from '../../middleware/auth.middleware';
import { authService } from './auth.service';
import {
  assertAllowedFields,
  isStrongPassword,
  isValidEmail,
  requirePositiveInt,
  requireString
} from '../../utils/validation';
import { ApiError } from '../../utils/api-error';

const sessionCookieOptions = {
  httpOnly: true,
  secure: env.secureCookies,
  sameSite: 'lax' as const,
  signed: true,
  maxAge: env.sessionTtlMinutes * 60 * 1000,
  path: '/'
};

class AuthController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['fullName', 'email', 'password']);

      const fullName = requireString('fullName', req.body?.fullName, 2, 120);
      const email = requireString('email', req.body?.email, 5, 180).toLowerCase();
      const password = requireString('password', req.body?.password, 8, 128);

      if (!isValidEmail(email)) {
        throw new ApiError(400, 'Email format is invalid');
      }

      if (!isStrongPassword(password)) {
        throw new ApiError(400, 'Password must include upper, lower, number, special character and 8+ chars');
      }

      const user = await authService.register({ fullName, email, password });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['email', 'password']);

      const email = requireString('email', req.body?.email, 5, 180).toLowerCase();
      const password = requireString('password', req.body?.password, 8, 128);

      if (!isValidEmail(email)) {
        throw new ApiError(400, 'Email format is invalid');
      }

      const result = await authService.login({
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      res.cookie(env.sessionCookieName, result.sessionId, sessionCookieOptions);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user: result.user }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      invalidateCurrentSession(req, res);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['email']);
      const email = requireString('email', req.body?.email, 5, 180).toLowerCase();

      if (!isValidEmail(email)) {
        throw new ApiError(400, 'Email format is invalid');
      }

      const result = await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'If the account exists, a reset code has been generated.',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const user = await authService.getCurrentUser(req.auth.userId);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      assertAllowedFields(req.body as Record<string, unknown>, ['fullName', 'email']);
      const fullName = typeof req.body?.fullName === 'string' ? requireString('fullName', req.body.fullName, 2, 120) : undefined;
      const email = typeof req.body?.email === 'string' ? requireString('email', req.body.email, 5, 180).toLowerCase() : undefined;

      if (email && !isValidEmail(email)) {
        throw new ApiError(400, 'Email format is invalid');
      }

      const user = await authService.updateProfile(req.auth.userId, { fullName, email });
      res.status(200).json({ success: true, message: 'Profile updated successfully', data: { user } });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      assertAllowedFields(req.body as Record<string, unknown>, ['currentPassword', 'newPassword']);
      const currentPassword = requireString('currentPassword', req.body?.currentPassword, 8, 128);
      const newPassword = requireString('newPassword', req.body?.newPassword, 8, 128);

      if (!isStrongPassword(newPassword)) {
        throw new ApiError(400, 'Password must include upper, lower, number, special character and 8+ chars');
      }

      await authService.changePassword(req.auth.userId, { currentPassword, newPassword });
      invalidateCurrentSession(req, res);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in again.'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['code', 'newPassword']);
      const code = requireString('code', req.body?.code, 6, 12);
      const newPassword = requireString('newPassword', req.body?.newPassword, 8, 128);

      if (!isStrongPassword(newPassword)) {
        throw new ApiError(400, 'Password must include upper, lower, number, special character and 8+ chars');
      }

      await authService.resetPassword({ code, newPassword });

      res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  };

  lockAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requirePositiveInt('userId', req.params.userId);
      await authService.lockAccount(userId);

      res.status(200).json({
        success: true,
        message: 'Account locked and active sessions invalidated'
      });
    } catch (error) {
      next(error);
    }
  };

  unlockAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requirePositiveInt('userId', req.params.userId);
      await authService.unlockAccount(userId);

      res.status(200).json({
        success: true,
        message: 'Account unlocked successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
