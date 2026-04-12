import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireCustomer } from '../../middleware/rbac.middleware';
import { cartController } from './cart.controller';

const cartRouter = Router();

cartRouter.use(requireAuth, requireCustomer);
cartRouter.get('/', cartController.getMyCart);
cartRouter.post('/items', cartController.addToCart);
cartRouter.patch('/items/:cartItemId', cartController.updateQuantity);
cartRouter.delete('/items/:cartItemId', cartController.removeItem);

export { cartRouter };
