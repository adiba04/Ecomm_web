import { AppDataSource } from '../../config/data-source';
import { CartItem } from '../../entities/cart-item.entity';
import { Cart } from '../../entities/cart.entity';
import { Product } from '../../entities/product.entity';
import { ApiError } from '../../utils/api-error';

interface CartItemView {
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

interface CartView {
  id: number;
  userId: number;
  items: CartItemView[];
  totals: {
    itemCount: number;
    subtotal: string;
  };
}

export class CartService {
  private readonly cartRepository = AppDataSource.getRepository(Cart);
  private readonly cartItemRepository = AppDataSource.getRepository(CartItem);
  private readonly productRepository = AppDataSource.getRepository(Product);

  async getCartByUserId(userId: number): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);

    const items = await this.cartItemRepository.find({
      where: { cartId: cart.id },
      relations: { product: true },
      order: { createdAt: 'DESC' }
    });

    return this.toCartView(cart, items);
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.getAvailableProduct(productId);

    const existingItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
      relations: { product: true }
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > product.stockQuantity) {
        throw new ApiError(400, 'Requested quantity exceeds stock');
      }

      existingItem.quantity = nextQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      if (quantity > product.stockQuantity) {
        throw new ApiError(400, 'Requested quantity exceeds stock');
      }

      const item = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity
      });

      await this.cartItemRepository.save(item);
    }

    return this.getCartByUserId(userId);
  }

  async updateCartItemQuantity(userId: number, cartItemId: number, quantity: number): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cartId: cart.id },
      relations: { product: true }
    });

    if (!item) {
      throw new ApiError(404, 'Cart item not found');
    }

    if (!item.product.isActive) {
      throw new ApiError(400, 'Cannot update quantity for inactive product');
    }

    if (quantity > item.product.stockQuantity) {
      throw new ApiError(400, 'Requested quantity exceeds stock');
    }

    item.quantity = quantity;
    await this.cartItemRepository.save(item);

    return this.getCartByUserId(userId);
  }

  async removeCartItem(userId: number, cartItemId: number): Promise<CartView> {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.cartItemRepository.findOne({ where: { id: cartItemId, cartId: cart.id } });
    if (!item) {
      throw new ApiError(404, 'Cart item not found');
    }

    await this.cartItemRepository.remove(item);
    return this.getCartByUserId(userId);
  }

  private async getOrCreateCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({ where: { userId } });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  private async getAvailableProduct(productId: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (!product.isActive) {
      throw new ApiError(400, 'Product is not available');
    }

    if (product.stockQuantity <= 0) {
      throw new ApiError(400, 'Product is out of stock');
    }

    return product;
  }

  private toCartView(cart: Cart, items: CartItem[]): CartView {
    const mappedItems = items.map((item) => {
      const unitPrice = Number(item.product.price);
      const lineTotal = unitPrice * item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        imageUrl: this.toPublicImageUrl(item.product.imageUrl),
        unitPrice: unitPrice.toFixed(2),
        quantity: item.quantity,
        lineTotal: lineTotal.toFixed(2),
        inStock: item.product.stockQuantity > 0 && item.product.isActive,
        stockQuantity: item.product.stockQuantity
      };
    });

    const subtotal = mappedItems.reduce((sum, item) => sum + Number(item.lineTotal), 0);
    const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      items: mappedItems,
      totals: {
        itemCount,
        subtotal: subtotal.toFixed(2)
      }
    };
  }

  private toPublicImageUrl(imagePath: string | null): string | null {
    if (!imagePath) {
      return null;
    }

    return `/ProductImages/${imagePath.replace(/^\/+/, '')}`;
  }
}

export const cartService = new CartService();
