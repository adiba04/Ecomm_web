import { AppDataSource } from '../../config/data-source';
import { Brackets } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';
import { SubCategory } from '../../entities/sub-category.entity';
import { Type } from '../../entities/type.entity';
import { ApiError } from '../../utils/api-error';
import { toSlug } from '../../utils/slug';

interface ListProductsInput {
  search?: string;
  typeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  subCategoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  includeInactive?: boolean;
  page: number;
  limit: number;
}

interface PaginatedProducts {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CreateProductInput {
  typeId: number;
  categoryId: number;
  subCategoryId: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
  imageUrl?: string | null;
}

interface UpdateProductInput {
  typeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  imageUrl?: string | null;
}

export class ProductsService {
  private readonly productRepository = AppDataSource.getRepository(Product);
  private readonly typeRepository = AppDataSource.getRepository(Type);
  private readonly categoryRepository = AppDataSource.getRepository(Category);
  private readonly subCategoryRepository = AppDataSource.getRepository(SubCategory);

  async listProducts(input: ListProductsInput): Promise<PaginatedProducts> {
    const query = this.productRepository.createQueryBuilder('product');
    query.leftJoinAndSelect('product.type', 'type');
    query.leftJoinAndSelect('product.category', 'category');
    query.leftJoinAndSelect('product.subCategory', 'subCategory');

    if (!input.includeInactive) {
      query.andWhere('product.is_active = :isActive', { isActive: true });
    }

    if (input.search) {
      const normalized = `%${input.search.toLowerCase()}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE :search', { search: normalized }).orWhere(
            'LOWER(product.description) LIKE :search',
            { search: normalized }
          );
        })
      );
    }

    if (typeof input.typeId !== 'undefined') {
      query.andWhere('product.type_id = :typeId', { typeId: input.typeId });
    }

    if (typeof input.categoryId !== 'undefined') {
      query.andWhere('product.category_id = :categoryId', { categoryId: input.categoryId });
    }

    if (typeof input.subCategoryId !== 'undefined') {
      query.andWhere('product.sub_category_id = :subCategoryId', { subCategoryId: input.subCategoryId });
    }

    if (input.subCategoryName) {
      query.andWhere('LOWER(subCategory.name) LIKE :subCategoryName', {
        subCategoryName: `%${input.subCategoryName.toLowerCase()}%`
      });
    }

    if (typeof input.minPrice !== 'undefined') {
      query.andWhere('product.price >= :minPrice', { minPrice: input.minPrice });
    }

    if (typeof input.maxPrice !== 'undefined') {
      query.andWhere('product.price <= :maxPrice', { maxPrice: input.maxPrice });
    }

    if (typeof input.inStock === 'boolean') {
      query.andWhere(input.inStock ? 'product.stock_quantity > 0' : 'product.stock_quantity <= 0');
    }

    query.orderBy('product.createdAt', 'DESC');
    query.skip((input.page - 1) * input.limit);
    query.take(input.limit);

    const [items, total] = await query.getManyAndCount();
    const mappedItems = items.map((item) => this.mapProduct(item));
    const totalPages = Math.max(1, Math.ceil(total / input.limit));

    return {
      items: mappedItems,
      page: input.page,
      limit: input.limit,
      total,
      totalPages
    };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        type: true,
        category: true,
        subCategory: true
      }
    });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return this.mapProduct(product);
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    await this.validateHierarchy(input.typeId, input.categoryId, input.subCategoryId);

    const product = this.productRepository.create({
      typeId: input.typeId,
      categoryId: input.categoryId,
      subCategoryId: input.subCategoryId,
      name: input.name,
      slug: toSlug(input.name),
      sku: input.sku,
      description: input.description,
      price: input.price.toFixed(2),
      stockQuantity: input.stockQuantity,
      isActive: input.isActive ?? true,
      imageUrl: input.imageUrl ?? null
    });

    const saved = await this.productRepository.save(product);
    return this.getProductById(saved.id);
  }

  async updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
    const product = await this.getProductById(id);

    const nextTypeId = input.typeId ?? product.typeId;
    const nextCategoryId = input.categoryId ?? product.categoryId;
    const nextSubCategoryId = input.subCategoryId ?? product.subCategoryId;
    await this.validateHierarchy(nextTypeId, nextCategoryId, nextSubCategoryId);

    if (typeof input.typeId !== 'undefined') product.typeId = input.typeId;
    if (typeof input.categoryId !== 'undefined') product.categoryId = input.categoryId;
    if (typeof input.subCategoryId !== 'undefined') product.subCategoryId = input.subCategoryId;
    if (typeof input.name === 'string') {
      product.name = input.name;
      product.slug = toSlug(input.name);
    }
    if (typeof input.sku === 'string') product.sku = input.sku;
    if (typeof input.description === 'string') product.description = input.description;
    if (typeof input.price === 'number') product.price = input.price.toFixed(2);
    if (typeof input.stockQuantity === 'number') product.stockQuantity = input.stockQuantity;
    if (typeof input.isActive === 'boolean') product.isActive = input.isActive;
    if (typeof input.imageUrl !== 'undefined') product.imageUrl = input.imageUrl;

    const saved = await this.productRepository.save(product);
    return this.getProductById(saved.id);
  }

  async deleteProduct(id: number): Promise<void> {
    const existing = await this.getProductById(id);
    await this.productRepository.remove(existing);
  }

  private async validateHierarchy(typeId: number, categoryId: number, subCategoryId: number): Promise<void> {
    const type = await this.typeRepository.findOne({ where: { id: typeId } });
    if (!type) {
      throw new ApiError(400, 'Invalid typeId');
    }

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new ApiError(400, 'Invalid categoryId');
    }

    if (category.typeId !== typeId) {
      throw new ApiError(400, 'Category does not belong to the provided type');
    }

    const subCategory = await this.subCategoryRepository.findOne({ where: { id: subCategoryId } });
    if (!subCategory) {
      throw new ApiError(400, 'Invalid subCategoryId');
    }

    if (subCategory.categoryId !== categoryId) {
      throw new ApiError(400, 'SubCategory does not belong to the provided category');
    }
  }

  private mapProduct(product: Product): Product {
    const imagePath = product.imageUrl ? product.imageUrl.replace(/^\/+/, '') : null;
    const publicUrl = imagePath ? `/ProductImages/${imagePath}` : null;

    return {
      ...product,
      imageUrl: publicUrl
    };
  }
}

export const productsService = new ProductsService();
