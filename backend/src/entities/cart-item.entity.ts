import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
@Check('CK_cart_items_quantity_positive', '"quantity" > 0')
@Index('UQ_cart_items_cart_product', ['cartId', 'productId'], { unique: true })
@Index('IX_cart_items_cart_id', ['cartId'])
@Index('IX_cart_items_product_id', ['productId'])
export class CartItem {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'cart_id' })
  cartId!: number;

  @Column({ type: 'int', name: 'product_id' })
  productId!: number;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
