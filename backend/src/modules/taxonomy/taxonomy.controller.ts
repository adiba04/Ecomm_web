import { NextFunction, Request, Response } from 'express';
import { assertAllowedFields, requirePositiveInt, requireString } from '../../utils/validation';
import { taxonomyService } from './taxonomy.service';

class TaxonomyController {
  listTypes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await taxonomyService.listTypes();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getTypeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      const data = await taxonomyService.getTypeById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  createType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['name', 'description']);
      const name = requireString('name', req.body?.name, 2, 120);
      const description = req.body?.description
        ? requireString('description', req.body.description, 2, 300)
        : null;

      const data = await taxonomyService.createType({ name, description });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['name', 'description']);
      const id = requirePositiveInt('id', req.params.id);
      const name = typeof req.body?.name === 'string' ? requireString('name', req.body.name, 2, 120) : undefined;
      const description =
        typeof req.body?.description === 'string'
          ? requireString('description', req.body.description, 2, 300)
          : req.body?.description === null
            ? null
            : undefined;

      const data = await taxonomyService.updateType(id, { name, description });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  deleteType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      await taxonomyService.deleteType(id);
      res.status(200).json({ success: true, message: 'Type deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  listCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const typeId = typeof req.query.typeId !== 'undefined' ? requirePositiveInt('typeId', req.query.typeId) : undefined;
      const data = await taxonomyService.listCategories(typeId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      const data = await taxonomyService.getCategoryById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['typeId', 'name']);
      const typeId = requirePositiveInt('typeId', req.body?.typeId);
      const name = requireString('name', req.body?.name, 2, 120);

      const data = await taxonomyService.createCategory({ typeId, name });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['typeId', 'name']);
      const id = requirePositiveInt('id', req.params.id);
      const typeId = typeof req.body?.typeId !== 'undefined' ? requirePositiveInt('typeId', req.body.typeId) : undefined;
      const name = typeof req.body?.name === 'string' ? requireString('name', req.body.name, 2, 120) : undefined;

      const data = await taxonomyService.updateCategory(id, { typeId, name });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      await taxonomyService.deleteCategory(id);
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  listSubCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId =
        typeof req.query.categoryId !== 'undefined'
          ? requirePositiveInt('categoryId', req.query.categoryId)
          : undefined;
      const data = await taxonomyService.listSubCategories(categoryId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getSubCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      const data = await taxonomyService.getSubCategoryById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  createSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['categoryId', 'name']);
      const categoryId = requirePositiveInt('categoryId', req.body?.categoryId);
      const name = requireString('name', req.body?.name, 2, 120);

      const data = await taxonomyService.createSubCategory({ categoryId, name });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, ['categoryId', 'name']);
      const id = requirePositiveInt('id', req.params.id);
      const categoryId =
        typeof req.body?.categoryId !== 'undefined'
          ? requirePositiveInt('categoryId', req.body.categoryId)
          : undefined;
      const name = typeof req.body?.name === 'string' ? requireString('name', req.body.name, 2, 120) : undefined;

      const data = await taxonomyService.updateSubCategory(id, { categoryId, name });
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  deleteSubCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      await taxonomyService.deleteSubCategory(id);
      res.status(200).json({ success: true, message: 'SubCategory deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export const taxonomyController = new TaxonomyController();
