import { QueryRunner } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { CartItem } from '../../entities/cart-item.entity';
import { Cart } from '../../entities/cart.entity';
import { OrderStatus } from '../../entities/enums/order-status.enum';
import { PaymentMethod } from '../../entities/enums/payment-method.enum';
import { OrderItem } from '../../entities/order-item.entity';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { ApiError } from '../../utils/api-error';

interface CheckoutInput {
  paymentMethod: PaymentMethod;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
}

export class OrdersService {
  async checkout(userId: number, input: CheckoutInput): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cartRepository = queryRunner.manager.getRepository(Cart);
      const cartItemRepository = queryRunner.manager.getRepository(CartItem);
      const productRepository = queryRunner.manager.getRepository(Product);
      const orderRepository = queryRunner.manager.getRepository(Order);
      const orderItemRepository = queryRunner.manager.getRepository(OrderItem);

      const cart = await cartRepository.findOne({ where: { userId } });
      if (!cart) {
        throw new ApiError(400, 'Cart is empty');
      }

      const cartItems = await cartItemRepository.find({
        where: { cartId: cart.id },
        relations: { product: true },
        order: { id: 'ASC' }
      });

      if (cartItems.length === 0) {
        throw new ApiError(400, 'Cart is empty');
      }

      let subtotal = 0;
      for (const item of cartItems) {
        if (!item.product || !item.product.isActive) {
          throw new ApiError(400, `Product not available: ${item.product?.name ?? item.productId}`);
        }

        if (item.quantity > item.product.stockQuantity) {
          throw new ApiError(400, `Insufficient stock for product: ${item.product.name}`);
        }

        subtotal += Number(item.product.price) * item.quantity;
      }

      const shippingAmount = 0;
      const totalAmount = subtotal + shippingAmount;

      const order = orderRepository.create({
        userId,
        orderNumber: await this.generateOrderNumber(queryRunner),
        status: OrderStatus.PENDING,
        paymentMethod: input.paymentMethod,
        subtotalAmount: subtotal.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        shippingFullName: input.shippingFullName,
        shippingPhone: input.shippingPhone,
        shippingAddressLine1: input.shippingAddressLine1,
        shippingAddressLine2: input.shippingAddressLine2 ?? null,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingPostalCode: input.shippingPostalCode,
        shippingCountry: input.shippingCountry
      });

      const savedOrder = await orderRepository.save(order);

      for (const item of cartItems) {
        const unitPrice = Number(item.product.price);
        const lineTotal = unitPrice * item.quantity;

        const orderItem = orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productNameSnapshot: item.product.name,
          skuSnapshot: item.product.sku,
          unitPriceSnapshot: unitPrice.toFixed(2),
          quantity: item.quantity,
          lineTotal: lineTotal.toFixed(2)
        });

        await orderItemRepository.save(orderItem);

        item.product.stockQuantity -= item.quantity;
        await productRepository.save(item.product);
      }

      await cartItemRepository.delete({ cartId: cart.id });

      await queryRunner.commitTransaction();
      return this.getOrderByIdForUser(savedOrder.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async listOrdersForUser(userId: number): Promise<Order[]> {
    const orderRepository = AppDataSource.getRepository(Order);
    return orderRepository.find({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' }
    });
  }

  async getOrderByIdForUser(orderId: number, userId: number): Promise<Order> {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: orderId, userId },
      relations: { items: true }
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  async confirmOrder(orderId: number, userId: number): Promise<Order> {
    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({ where: { id: orderId, userId } });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ApiError(400, 'Only pending orders can be confirmed');
    }

    order.status = OrderStatus.CONFIRMED;
    await orderRepository.save(order);

    return this.getOrderByIdForUser(order.id, userId);
  }

  private async generateOrderNumber(queryRunner: QueryRunner): Promise<string> {
    const orderRepository = queryRunner.manager.getRepository(Order);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const existing = await orderRepository.findOne({ where: { orderNumber }, select: ['id'] });
      if (!existing) {
        return orderNumber;
      }
    }

    throw new ApiError(500, 'Unable to generate order number');
  }
}

export const ordersService = new OrdersService();
