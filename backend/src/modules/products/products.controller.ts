import { NextFunction, Request, Response } from 'express';
import { assertAllowedFields, requireNumber, requirePositiveInt, requireString } from '../../utils/validation';
import { productsService } from './products.service';
import { ApiError } from '../../utils/api-error';

const parseOptionalBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'undefined') return undefined;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new ApiError(400, 'isActive must be boolean');
};

const parseOptionalPositiveInt = (field: string, value: unknown): number | undefined => {
  if (typeof value === 'undefined') {
    return undefined;
  }

  return requirePositiveInt(field, value);
};

const parseOptionalNumber = (field: string, value: unknown): number | undefined => {
  if (typeof value === 'undefined') {
    return undefined;
  }

  return requireNumber(field, value);
};

class ProductsController {
  listProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const typeId = parseOptionalPositiveInt('typeId', req.query.typeId);
      const categoryId = parseOptionalPositiveInt('categoryId', req.query.categoryId);
      const subCategoryId = parseOptionalPositiveInt('subCategoryId', req.query.subCategoryId);
      const subCategoryName = typeof req.query.subCategoryName === 'string' ? req.query.subCategoryName.trim() : undefined;
      const minPrice = parseOptionalNumber('minPrice', req.query.minPrice);
      const maxPrice = parseOptionalNumber('maxPrice', req.query.maxPrice);
      const inStock = parseOptionalBoolean(req.query.inStock);

      const page = Math.max(1, parseOptionalPositiveInt('page', req.query.page) ?? 1);
      const limit = Math.min(100, Math.max(1, parseOptionalPositiveInt('limit', req.query.limit) ?? 12));

      if (typeof minPrice === 'number' && minPrice < 0) {
        throw new ApiError(400, 'minPrice must be >= 0');
      }

      if (typeof maxPrice === 'number' && maxPrice < 0) {
        throw new ApiError(400, 'maxPrice must be >= 0');
      }

      if (typeof minPrice === 'number' && typeof maxPrice === 'number' && minPrice > maxPrice) {
        throw new ApiError(400, 'minPrice cannot be greater than maxPrice');
      }

      const result = await productsService.listProducts({
        search: search && search.length > 0 ? search : undefined,
        typeId,
        categoryId,
        subCategoryId,
        subCategoryName: subCategoryName && subCategoryName.length > 0 ? subCategoryName : undefined,
        minPrice,
        maxPrice,
        inStock,
        includeInactive,
        page,
        limit
      });

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

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      const data = await productsService.getProductById(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, [
        'typeId',
        'categoryId',
        'subCategoryId',
        'name',
        'sku',
        'description',
        'price',
        'stockQuantity',
        'isActive'
      ]);

      const typeId = requirePositiveInt('typeId', req.body?.typeId);
      const categoryId = requirePositiveInt('categoryId', req.body?.categoryId);
      const subCategoryId = requirePositiveInt('subCategoryId', req.body?.subCategoryId);
      const name = requireString('name', req.body?.name, 2, 180);
      const sku = requireString('sku', req.body?.sku, 2, 80).toUpperCase();
      const description = requireString('description', req.body?.description, 2, 2000);
      const price = requireNumber('price', req.body?.price);
      const stockQuantity = requirePositiveInt('stockQuantity', req.body?.stockQuantity);
      const isActive = parseOptionalBoolean(req.body?.isActive);
      const imageUrl = req.file ? `products/${req.file.filename}` : null;

      const data = await productsService.createProduct({
        typeId,
        categoryId,
        subCategoryId,
        name,
        sku,
        description,
        price,
        stockQuantity,
        isActive,
        imageUrl
      });

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAllowedFields(req.body as Record<string, unknown>, [
        'typeId',
        'categoryId',
        'subCategoryId',
        'name',
        'sku',
        'description',
        'price',
        'stockQuantity',
        'isActive',
        'imageUrl'
      ]);

      const id = requirePositiveInt('id', req.params.id);
      const typeId = typeof req.body?.typeId !== 'undefined' ? requirePositiveInt('typeId', req.body.typeId) : undefined;
      const categoryId =
        typeof req.body?.categoryId !== 'undefined' ? requirePositiveInt('categoryId', req.body.categoryId) : undefined;
      const subCategoryId =
        typeof req.body?.subCategoryId !== 'undefined'
          ? requirePositiveInt('subCategoryId', req.body.subCategoryId)
          : undefined;
      const name = typeof req.body?.name === 'string' ? requireString('name', req.body.name, 2, 180) : undefined;
      const sku = typeof req.body?.sku === 'string' ? requireString('sku', req.body.sku, 2, 80).toUpperCase() : undefined;
      const description =
        typeof req.body?.description === 'string'
          ? requireString('description', req.body.description, 2, 2000)
          : undefined;
      const price = typeof req.body?.price !== 'undefined' ? requireNumber('price', req.body.price) : undefined;
      const stockQuantity =
        typeof req.body?.stockQuantity !== 'undefined'
          ? requirePositiveInt('stockQuantity', req.body.stockQuantity)
          : undefined;
      const isActive = parseOptionalBoolean(req.body?.isActive);

      const imageUrl = req.file
        ? `products/${req.file.filename}`
        : typeof req.body?.imageUrl === 'string'
          ? requireString('imageUrl', req.body.imageUrl, 2, 500)
          : req.body?.imageUrl === null
            ? null
            : undefined;

      const data = await productsService.updateProduct(id, {
        typeId,
        categoryId,
        subCategoryId,
        name,
        sku,
        description,
        price,
        stockQuantity,
        isActive,
        imageUrl
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = requirePositiveInt('id', req.params.id);
      await productsService.deleteProduct(id);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export const productsController = new ProductsController();
