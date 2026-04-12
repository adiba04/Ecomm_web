import { NextFunction, Request, Response } from 'express';
import { PaymentMethod } from '../../entities/enums/payment-method.enum';
import { ApiError } from '../../utils/api-error';
import { assertAllowedFields, requirePositiveInt, requireString } from '../../utils/validation';
import { ordersService } from './orders.service';

class OrdersController {
  checkout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      assertAllowedFields(req.body as Record<string, unknown>, [
        'paymentMethod',
        'shippingFullName',
        'shippingPhone',
        'shippingAddressLine1',
        'shippingAddressLine2',
        'shippingCity',
        'shippingState',
        'shippingPostalCode',
        'shippingCountry'
      ]);

      const paymentMethod = requireString('paymentMethod', req.body?.paymentMethod, 2, 30) as PaymentMethod;
      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        throw new ApiError(400, 'Invalid payment method');
      }

      const shippingFullName = requireString('shippingFullName', req.body?.shippingFullName, 2, 120);
      const shippingPhone = requireString('shippingPhone', req.body?.shippingPhone, 6, 20);
      const shippingAddressLine1 = requireString('shippingAddressLine1', req.body?.shippingAddressLine1, 4, 300);
      const shippingAddressLine2 =
        typeof req.body?.shippingAddressLine2 === 'string'
          ? requireString('shippingAddressLine2', req.body.shippingAddressLine2, 2, 300)
          : null;
      const shippingCity = requireString('shippingCity', req.body?.shippingCity, 2, 100);
      const shippingState = requireString('shippingState', req.body?.shippingState, 2, 100);
      const shippingPostalCode = requireString('shippingPostalCode', req.body?.shippingPostalCode, 2, 20);
      const shippingCountry = requireString('shippingCountry', req.body?.shippingCountry, 2, 100);

      const data = await ordersService.checkout(req.auth.userId, {
        paymentMethod,
        shippingFullName,
        shippingPhone,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingCountry
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  listMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const data = await ordersService.listOrdersForUser(req.auth.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getMyOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const orderId = requirePositiveInt('orderId', req.params.orderId);
      const data = await ordersService.getOrderByIdForUser(orderId, req.auth.userId);

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  confirmMyOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const orderId = requirePositiveInt('orderId', req.params.orderId);
      const data = await ordersService.confirmOrder(orderId, req.auth.userId);

      res.status(200).json({
        success: true,
        message: 'Order confirmed successfully',
        data
      });
    } catch (error) {
      next(error);
    }
  };
}

export const ordersController = new OrdersController();
