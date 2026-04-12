export interface OrderItem {
  id: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  subtotalAmount: string;
  shippingAmount: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutPayload {
  paymentMethod: 'CASH_ON_DELIVERY' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
}
