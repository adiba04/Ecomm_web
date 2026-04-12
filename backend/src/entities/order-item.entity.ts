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
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
@Check('CK_order_items_quantity_positive', '"quantity" > 0')
@Check('CK_order_items_unit_price_non_negative', '"unit_price_snapshot" >= 0')
@Check('CK_order_items_line_total_non_negative', '"line_total" >= 0')
@Index('IX_order_items_order_id', ['orderId'])
@Index('IX_order_items_product_id', ['productId'])
@Index('UQ_order_items_order_product', ['orderId', 'productId'])
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'order_id' })
  orderId!: number;

  @Column({ type: 'int', name: 'product_id', nullable: true })
  productId!: number | null;

  @Column({ type: 'varchar', length: 180, name: 'product_name_snapshot' })
  productNameSnapshot!: string;

  @Column({ type: 'varchar', length: 80, name: 'sku_snapshot' })
  skuSnapshot!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_price_snapshot' })
  unitPriceSnapshot!: string;

  @Column({ type: 'int', name: 'quantity' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'line_total' })
  lineTotal!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'SET NULL',
    nullable: true
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product | null;
}
