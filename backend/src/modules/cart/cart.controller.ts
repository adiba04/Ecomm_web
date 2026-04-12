import { NextFunction, Request, Response } from 'express';
import { requirePositiveInt } from '../../utils/validation';
import { cartService } from './cart.service';
import { ApiError } from '../../utils/api-error';

class CartController {
  getMyCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const data = await cartService.getCartByUserId(req.auth.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const productId = requirePositiveInt('productId', req.body?.productId);
      const quantity = requirePositiveInt('quantity', req.body?.quantity);

      const data = await cartService.addToCart(req.auth.userId, productId, quantity);
      res.status(200).json({ success: true, message: 'Item added to cart', data });
    } catch (error) {
      next(error);
    }
  };

  updateQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const cartItemId = requirePositiveInt('cartItemId', req.params.cartItemId);
      const quantity = requirePositiveInt('quantity', req.body?.quantity);

      const data = await cartService.updateCartItemQuantity(req.auth.userId, cartItemId, quantity);
      res.status(200).json({ success: true, message: 'Cart item updated', data });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth) {
        throw new ApiError(401, 'Authentication required');
      }

      const cartItemId = requirePositiveInt('cartItemId', req.params.cartItemId);
      const data = await cartService.removeCartItem(req.auth.userId, cartItemId);
      res.status(200).json({ success: true, message: 'Cart item removed', data });
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController();
