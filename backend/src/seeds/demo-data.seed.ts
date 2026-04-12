import { AppDataSource } from '../config/data-source';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { SubCategory } from '../entities/sub-category.entity';
import { Type } from '../entities/type.entity';
import { toSlug } from '../utils/slug';

interface DemoProductInput {
  typeName: string;
  categoryName: string;
  subCategoryName: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

const demoProducts: DemoProductInput[] = [
  {
    typeName: 'Electronics',
    categoryName: 'Computer Peripherals',
    subCategoryName: 'Keyboards',
    name: 'Anker Multimedia Keyboard',
    sku: 'EL-KB-1001',
    description: 'Full-size wired multimedia keyboard with quiet keys and spill-resistant design.',
    price: 39.99,
    stockQuantity: 45,
    imageUrl: 'products/anker-multimedia-keyboard.svg'
  },
  {
    typeName: 'Electronics',
    categoryName: 'Computer Peripherals',
    subCategoryName: 'Mice',
    name: 'Logi Precision Wireless Mouse',
    sku: 'EL-MS-1002',
    description: 'Ergonomic wireless mouse with adjustable DPI and long battery life.',
    price: 29.5,
    stockQuantity: 60,
    imageUrl: 'products/logi-precision-wireless-mouse.svg'
  },
  {
    typeName: 'Electronics',
    categoryName: 'Audio',
    subCategoryName: 'Headphones',
    name: 'SonicWave Noise-Cancel Headphones',
    sku: 'EL-HP-1003',
    description: 'Over-ear Bluetooth headphones with active noise cancellation and deep bass.',
    price: 129.0,
    stockQuantity: 24,
    imageUrl: 'products/sonicwave-noise-cancel-headphones.svg'
  },
  {
    typeName: 'Stationery',
    categoryName: 'Kids',
    subCategoryName: 'Textbooks',
    name: 'Multiplication Table Book',
    sku: 'ST-TB-2001',
    description: 'Colorful learning book for multiplication tables with practice activities.',
    price: 12.75,
    stockQuantity: 80,
    imageUrl: 'products/multiplication-table-book.svg'
  },
  {
    typeName: 'Stationery',
    categoryName: 'Writing Supplies',
    subCategoryName: 'Pens',
    name: 'SmoothFlow Gel Pen Set',
    sku: 'ST-PN-2002',
    description: 'Pack of 10 smooth-flow gel pens for school and office writing.',
    price: 8.2,
    stockQuantity: 120,
    imageUrl: 'products/smoothflow-gel-pen-set.svg'
  },
  {
    typeName: 'Furniture',
    categoryName: 'Living Room',
    subCategoryName: 'Tables',
    name: 'Wooden Table',
    sku: 'FU-TB-3001',
    description: 'Solid wood center table with natural finish for modern living spaces.',
    price: 199.0,
    stockQuantity: 14,
    imageUrl: 'products/wooden-table.svg'
  },
  {
    typeName: 'Furniture',
    categoryName: 'Office Furniture',
    subCategoryName: 'Chairs',
    name: 'ErgoMesh Office Chair',
    sku: 'FU-CH-3002',
    description: 'Adjustable ergonomic office chair with breathable mesh back support.',
    price: 249.99,
    stockQuantity: 18,
    imageUrl: 'products/ergomesh-office-chair.svg'
  },
  {
    typeName: 'Furniture',
    categoryName: 'Bedroom',
    subCategoryName: 'Storage',
    name: 'Oak 3-Drawer Dresser',
    sku: 'FU-ST-3003',
    description: 'Durable oak dresser with three spacious drawers and soft-close rails.',
    price: 329.0,
    stockQuantity: 9,
    imageUrl: 'products/oak-3-drawer-dresser.svg'
  }
];

const getOrCreateType = async (name: string): Promise<Type> => {
  const typeRepository = AppDataSource.getRepository(Type);
  const slug = toSlug(name);

  let type = await typeRepository.findOne({ where: [{ name }, { slug }] });
  if (type) {
    return type;
  }

  type = typeRepository.create({
    name,
    slug,
    description: `${name} catalog`
  });

  return typeRepository.save(type);
};

const getOrCreateCategory = async (typeId: number, name: string): Promise<Category> => {
  const categoryRepository = AppDataSource.getRepository(Category);
  const slug = toSlug(name);

  let category = await categoryRepository.findOne({ where: { typeId, slug } });
  if (category) {
    return category;
  }

  category = categoryRepository.create({
    typeId,
    name,
    slug
  });

  return categoryRepository.save(category);
};

const getOrCreateSubCategory = async (categoryId: number, name: string): Promise<SubCategory> => {
  const subCategoryRepository = AppDataSource.getRepository(SubCategory);
  const slug = toSlug(name);

  let subCategory = await subCategoryRepository.findOne({ where: { categoryId, slug } });
  if (subCategory) {
    return subCategory;
  }

  subCategory = subCategoryRepository.create({
    categoryId,
    name,
    slug
  });

  return subCategoryRepository.save(subCategory);
};

const getOrCreateProduct = async (
  input: DemoProductInput,
  typeId: number,
  categoryId: number,
  subCategoryId: number
): Promise<'created' | 'updated'> => {
  const productRepository = AppDataSource.getRepository(Product);
  const slug = toSlug(input.name);

  let existing = await productRepository.findOne({
    where: [{ sku: input.sku }, { slug }],
    select: ['id', 'sku', 'slug']
  });

  if (existing) {
    await productRepository.update(existing.id, {
      typeId,
      categoryId,
      subCategoryId,
      name: input.name,
      slug,
      sku: input.sku,
      description: input.description,
      price: input.price.toFixed(2),
      stockQuantity: input.stockQuantity,
      isActive: true,
      imageUrl: input.imageUrl ?? null
    });

    return 'updated';
  }

  const product = productRepository.create({
    typeId,
    categoryId,
    subCategoryId,
    name: input.name,
    slug,
    sku: input.sku,
    description: input.description,
    price: input.price.toFixed(2),
    stockQuantity: input.stockQuantity,
    isActive: true,
    imageUrl: input.imageUrl ?? null
  });

  await productRepository.save(product);
  return 'created';
};

export const runDemoDataSeed = async (): Promise<void> => {
  let createdCount = 0;
  let updatedCount = 0;

  for (const item of demoProducts) {
    const type = await getOrCreateType(item.typeName);
    const category = await getOrCreateCategory(type.id, item.categoryName);
    const subCategory = await getOrCreateSubCategory(category.id, item.subCategoryName);

    const result = await getOrCreateProduct(item, type.id, category.id, subCategory.id);
    if (result === 'created') {
      createdCount += 1;
    } else {
      updatedCount += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Demo seed completed: ${createdCount} created, ${updatedCount} updated`);
};
