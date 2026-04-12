export interface CartItemView {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  imageUrl: string | null;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface CartView {
  id: number;
  userId: number;
  items: CartItemView[];
  totals: {
    itemCount: number;
    subtotal: string;
  };
}
