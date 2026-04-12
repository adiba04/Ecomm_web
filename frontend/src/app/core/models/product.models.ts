export interface Product {
  id: number;
  typeId: number;
  categoryId: number;
  subCategoryId: number;
  name: string;
  description: string;
  slug: string;
  sku: string;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string | null;
  type?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  subCategory?: {
    id: number;
    name: string;
  };
}

export interface ProductsQuery {
  search?: string;
  typeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  subCategoryName?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface TaxonomyType {
  id: number;
  name: string;
}

export interface TaxonomyCategory {
  id: number;
  typeId: number;
  name: string;
}

export interface TaxonomySubCategory {
  id: number;
  categoryId: number;
  name: string;
}
