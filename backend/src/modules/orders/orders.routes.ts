import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireCustomer } from '../../middleware/rbac.middleware';
import { ordersController } from './orders.controller';

const ordersRouter = Router();

ordersRouter.use(requireAuth, requireCustomer);
ordersRouter.post('/checkout', ordersController.checkout);
ordersRouter.get('/', ordersController.listMyOrders);
ordersRouter.get('/:orderId', ordersController.getMyOrderById);
ordersRouter.post('/:orderId/confirm', ordersController.confirmMyOrder);

export { ordersRouter };
