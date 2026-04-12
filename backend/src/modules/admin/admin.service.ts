import { Brackets } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { OrderStatus } from '../../entities/enums/order-status.enum';
import { Order } from '../../entities/order.entity';
import { Product } from '../../entities/product.entity';
import { UserRole } from '../../entities/enums/user-role.enum';
import { User } from '../../entities/user.entity';
import { sessionStore } from '../../security/sessionStore';
import { ApiError } from '../../utils/api-error';

interface PaginationInput {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class AdminService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly orderRepository = AppDataSource.getRepository(Order);
  private readonly productRepository = AppDataSource.getRepository(Product);

  async listCustomers(
    options: PaginationInput & { search?: string; isLocked?: boolean }
  ): Promise<PaginatedResult<Pick<User, 'id' | 'fullName' | 'email' | 'isLocked' | 'createdAt'>>> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.fullName', 'user.email', 'user.isLocked', 'user.createdAt'])
      .where('user.role = :role', { role: UserRole.CUSTOMER });

    if (options.search) {
      const searchValue = `%${options.search.toLowerCase()}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(user.full_name) LIKE :search', { search: searchValue }).orWhere(
            'LOWER(user.email) LIKE :search',
            { search: searchValue }
          );
        })
      );
    }

    if (typeof options.isLocked === 'boolean') {
      query.andWhere('user.is_locked = :isLocked', { isLocked: options.isLocked });
    }

    query.orderBy('user.created_at', 'DESC');
    query.skip((options.page - 1) * options.limit);
    query.take(options.limit);

    const [items, total] = await query.getManyAndCount();
    return {
      items,
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / options.limit))
    };
  }

  async lockCustomer(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.CUSTOMER },
      select: ['id', 'isLocked']
    });

    if (!user) {
      throw new ApiError(404, 'Customer not found');
    }

    if (!user.isLocked) {
      user.isLocked = true;
      await this.userRepository.save(user);
    }

    sessionStore.revokeSessionsByUser(user.id);
  }

  async unlockCustomer(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: UserRole.CUSTOMER },
      select: ['id', 'isLocked']
    });

    if (!user) {
      throw new ApiError(404, 'Customer not found');
    }

    if (user.isLocked) {
      user.isLocked = false;
      await this.userRepository.save(user);
    }
  }

  async listAllOrders(
    options: PaginationInput & { status?: OrderStatus }
  ): Promise<PaginatedResult<Order>> {
    const query = this.orderRepository.createQueryBuilder('order');
    query.leftJoinAndSelect('order.items', 'items');

    if (options.status) {
      query.andWhere('order.status = :status', { status: options.status });
    }

    query.orderBy('order.created_at', 'DESC');
    query.skip((options.page - 1) * options.limit);
    query.take(options.limit);

    const [items, total] = await query.getManyAndCount();
    return {
      items,
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / options.limit))
    };
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: { items: true }
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }

  async listAllProducts(options: PaginationInput & { search?: string }): Promise<PaginatedResult<Product>> {
    const query = this.productRepository.createQueryBuilder('product');

    if (options.search) {
      const searchValue = `%${options.search.toLowerCase()}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE :search', { search: searchValue }).orWhere(
            'LOWER(product.sku) LIKE :search',
            { search: searchValue }
          );
        })
      );
    }

    query.orderBy('product.created_at', 'DESC');
    query.skip((options.page - 1) * options.limit);
    query.take(options.limit);

    const [items, total] = await query.getManyAndCount();
    const mappedItems = items.map((item) => ({
      ...item,
      imageUrl: item.imageUrl ? `/ProductImages/${item.imageUrl.replace(/^\/+/, '')}` : null
    }));
    return {
      items: mappedItems,
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / options.limit))
    };
  }
}

export const adminService = new AdminService();
