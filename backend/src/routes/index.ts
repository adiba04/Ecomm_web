import { Router } from 'express';
import { adminRouter } from '../modules/admin/admin.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { cartRouter } from '../modules/cart/cart.routes';
import { ordersRouter } from '../modules/orders/orders.routes';
import { productsRouter } from '../modules/products/products.routes';
import { taxonomyRouter } from '../modules/taxonomy/taxonomy.routes';
import { healthRouter } from './health.routes';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/taxonomy', taxonomyRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/orders', ordersRouter);

export { apiRouter };
