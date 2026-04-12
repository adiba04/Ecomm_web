import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/rbac.middleware';
import { taxonomyController } from './taxonomy.controller';

const taxonomyRouter = Router();

taxonomyRouter.get('/types', taxonomyController.listTypes);
taxonomyRouter.get('/types/:id', taxonomyController.getTypeById);
taxonomyRouter.post('/types', requireAuth, requireAdmin, taxonomyController.createType);
taxonomyRouter.patch('/types/:id', requireAuth, requireAdmin, taxonomyController.updateType);
taxonomyRouter.delete('/types/:id', requireAuth, requireAdmin, taxonomyController.deleteType);

taxonomyRouter.get('/categories', taxonomyController.listCategories);
taxonomyRouter.get('/categories/:id', taxonomyController.getCategoryById);
taxonomyRouter.post('/categories', requireAuth, requireAdmin, taxonomyController.createCategory);
taxonomyRouter.patch('/categories/:id', requireAuth, requireAdmin, taxonomyController.updateCategory);
taxonomyRouter.delete('/categories/:id', requireAuth, requireAdmin, taxonomyController.deleteCategory);

taxonomyRouter.get('/sub-categories', taxonomyController.listSubCategories);
taxonomyRouter.get('/sub-categories/:id', taxonomyController.getSubCategoryById);
taxonomyRouter.post('/sub-categories', requireAuth, requireAdmin, taxonomyController.createSubCategory);
taxonomyRouter.patch('/sub-categories/:id', requireAuth, requireAdmin, taxonomyController.updateSubCategory);
taxonomyRouter.delete('/sub-categories/:id', requireAuth, requireAdmin, taxonomyController.deleteSubCategory);

export { taxonomyRouter };
