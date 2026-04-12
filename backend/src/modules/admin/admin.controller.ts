import { NextFunction, Request, Response } from 'express';
import { OrderStatus } from '../../entities/enums/order-status.enum';
import { ApiError } from '../../utils/api-error';
import { requirePositiveInt } from '../../utils/validation';
import { adminService } from './admin.service';

const parseOptionalBool = (value: unknown): boolean | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  throw new ApiError(400, 'Invalid boolean query value');
};

const parseOptionalPositiveInt = (field: string, value: unknown): number | undefined => {
  if (typeof value === 'undefined') return undefined;
  return requirePositiveInt(field, value);
};

class AdminController {
  listCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseOptionalPositiveInt('page', req.query.page) ?? 1);
      const limit = Math.min(100, Math.max(1, parseOptionalPositiveInt('limit', req.query.limit) ?? 20));
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const isLocked = parseOptionalBool(req.query.isLocked);

      const result = await adminService.listCustomers({ page, limit, search, isLocked });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  lockCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requirePositiveInt('userId', req.params.userId);
      await adminService.lockCustomer(userId);
      res.status(200).json({ success: true, message: 'Customer locked and sessions invalidated' });
    } catch (error) {
      next(error);
    }
  };

  unlockCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requirePositiveInt('userId', req.params.userId);
      await adminService.unlockCustomer(userId);
      res.status(200).json({ success: true, message: 'Customer unlocked' });
    } catch (error) {
      next(error);
    }
  };

  listOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseOptionalPositiveInt('page', req.query.page) ?? 1);
      const limit = Math.min(100, Math.max(1, parseOptionalPositiveInt('limit', req.query.limit) ?? 20));
      const statusRaw = typeof req.query.status === 'string' ? req.query.status : undefined;
      const status =
        statusRaw && Object.values(OrderStatus).includes(statusRaw as OrderStatus)
          ? (statusRaw as OrderStatus)
          : undefined;

      if (statusRaw && !status) {
        throw new ApiError(400, 'Invalid order status');
      }

      const result = await adminService.listAllOrders({ page, limit, status });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = requirePositiveInt('orderId', req.params.orderId);
      const data = await adminService.getOrderById(orderId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  listProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseOptionalPositiveInt('page', req.query.page) ?? 1);
      const limit = Math.min(100, Math.max(1, parseOptionalPositiveInt('limit', req.query.limit) ?? 20));
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;

      const result = await adminService.listAllProducts({ page, limit, search });
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
