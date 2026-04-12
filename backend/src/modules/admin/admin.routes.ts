import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { adminController } from './admin.controller';

const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/customers', adminController.listCustomers);
adminRouter.patch('/customers/:userId/lock', adminController.lockCustomer);
adminRouter.patch('/customers/:userId/unlock', adminController.unlockCustomer);

adminRouter.get('/orders', adminController.listOrders);
adminRouter.get('/orders/:orderId', adminController.getOrderById);

adminRouter.get('/products', adminController.listProducts);

export { adminRouter };
