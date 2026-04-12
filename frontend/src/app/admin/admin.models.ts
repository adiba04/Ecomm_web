export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: ApiPagination;
}

export interface AdminProduct {
  id: number;
  typeId: number;
  categoryId: number;
  subCategoryId: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  stockQuantity: number;
  isActive: boolean;
  imageUrl: string | null;
}

export interface AdminCustomer {
  id: number;
  fullName: string;
  email: string;
  isLocked: boolean;
  createdAt: string;
}

export interface AdminOrderItem {
  id: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
}

export interface AdminOrder {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  subtotalAmount?: string;
  shippingAmount?: string;
  totalAmount: string;
  shippingFullName?: string;
  shippingPhone?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string | null;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  createdAt: string;
  items: AdminOrderItem[];
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
