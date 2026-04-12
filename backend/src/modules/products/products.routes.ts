import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { productImageUpload } from '../../middleware/upload.middleware';
import { productsController } from './products.controller';

const productsRouter = Router();

productsRouter.get('/', productsController.listProducts);
productsRouter.get('/:id', productsController.getProductById);

productsRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  productImageUpload.single('image'),
  productsController.createProduct
);

productsRouter.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  productImageUpload.single('image'),
  productsController.updateProduct
);

productsRouter.delete('/:id', requireAuth, requireAdmin, productsController.deleteProduct);

export { productsRouter };
