import { AppDataSource } from '../../config/data-source';
import { Category } from '../../entities/category.entity';
import { SubCategory } from '../../entities/sub-category.entity';
import { Type } from '../../entities/type.entity';
import { ApiError } from '../../utils/api-error';
import { toSlug } from '../../utils/slug';

interface CreateTypeInput {
  name: string;
  description?: string | null;
}

interface UpdateTypeInput {
  name?: string;
  description?: string | null;
}

interface CreateCategoryInput {
  typeId: number;
  name: string;
}

interface UpdateCategoryInput {
  typeId?: number;
  name?: string;
}

interface CreateSubCategoryInput {
  categoryId: number;
  name: string;
}

interface UpdateSubCategoryInput {
  categoryId?: number;
  name?: string;
}

export class TaxonomyService {
  private readonly typeRepository = AppDataSource.getRepository(Type);
  private readonly categoryRepository = AppDataSource.getRepository(Category);
  private readonly subCategoryRepository = AppDataSource.getRepository(SubCategory);

  async listTypes(): Promise<Type[]> {
    return this.typeRepository.find({ order: { name: 'ASC' } });
  }

  async getTypeById(id: number): Promise<Type> {
    const entity = await this.typeRepository.findOne({ where: { id } });
    if (!entity) {
      throw new ApiError(404, 'Type not found');
    }
    return entity;
  }

  async createType(input: CreateTypeInput): Promise<Type> {
    const slug = toSlug(input.name);
    const type = this.typeRepository.create({
      name: input.name,
      slug,
      description: input.description ?? null
    });
    return this.typeRepository.save(type);
  }

  async updateType(id: number, input: UpdateTypeInput): Promise<Type> {
    const existing = await this.getTypeById(id);
    if (input.name) {
      existing.name = input.name;
      existing.slug = toSlug(input.name);
    }
    if (typeof input.description !== 'undefined') {
      existing.description = input.description;
    }

    return this.typeRepository.save(existing);
  }

  async deleteType(id: number): Promise<void> {
    const existing = await this.getTypeById(id);
    await this.typeRepository.remove(existing);
  }

  async listCategories(typeId?: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: typeId ? { typeId } : {},
      order: { name: 'ASC' }
    });
  }

  async getCategoryById(id: number): Promise<Category> {
    const entity = await this.categoryRepository.findOne({ where: { id } });
    if (!entity) {
      throw new ApiError(404, 'Category not found');
    }
    return entity;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const parentType = await this.typeRepository.findOne({ where: { id: input.typeId } });
    if (!parentType) {
      throw new ApiError(400, 'Invalid typeId');
    }

    const category = this.categoryRepository.create({
      typeId: input.typeId,
      name: input.name,
      slug: toSlug(input.name)
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.getCategoryById(id);

    if (typeof input.typeId !== 'undefined') {
      const parentType = await this.typeRepository.findOne({ where: { id: input.typeId } });
      if (!parentType) {
        throw new ApiError(400, 'Invalid typeId');
      }
      existing.typeId = input.typeId;
    }

    if (input.name) {
      existing.name = input.name;
      existing.slug = toSlug(input.name);
    }

    return this.categoryRepository.save(existing);
  }

  async deleteCategory(id: number): Promise<void> {
    const existing = await this.getCategoryById(id);
    await this.categoryRepository.remove(existing);
  }

  async listSubCategories(categoryId?: number): Promise<SubCategory[]> {
    return this.subCategoryRepository.find({
      where: categoryId ? { categoryId } : {},
      order: { name: 'ASC' }
    });
  }

  async getSubCategoryById(id: number): Promise<SubCategory> {
    const entity = await this.subCategoryRepository.findOne({ where: { id } });
    if (!entity) {
      throw new ApiError(404, 'SubCategory not found');
    }
    return entity;
  }

  async createSubCategory(input: CreateSubCategoryInput): Promise<SubCategory> {
    const parentCategory = await this.categoryRepository.findOne({ where: { id: input.categoryId } });
    if (!parentCategory) {
      throw new ApiError(400, 'Invalid categoryId');
    }

    const entity = this.subCategoryRepository.create({
      categoryId: input.categoryId,
      name: input.name,
      slug: toSlug(input.name)
    });

    return this.subCategoryRepository.save(entity);
  }

  async updateSubCategory(id: number, input: UpdateSubCategoryInput): Promise<SubCategory> {
    const existing = await this.getSubCategoryById(id);

    if (typeof input.categoryId !== 'undefined') {
      const parentCategory = await this.categoryRepository.findOne({ where: { id: input.categoryId } });
      if (!parentCategory) {
        throw new ApiError(400, 'Invalid categoryId');
      }
      existing.categoryId = input.categoryId;
    }

    if (input.name) {
      existing.name = input.name;
      existing.slug = toSlug(input.name);
    }

    return this.subCategoryRepository.save(existing);
  }

  async deleteSubCategory(id: number): Promise<void> {
    const existing = await this.getSubCategoryById(id);
    await this.subCategoryRepository.remove(existing);
  }
}

export const taxonomyService = new TaxonomyService();
