import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../entities/enums/user-role.enum';
import { ApiError } from '../utils/api-error';

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new ApiError(401, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.auth.role)) {
      next(new ApiError(403, 'Access denied'));
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireCustomer = requireRole(UserRole.CUSTOMER);
