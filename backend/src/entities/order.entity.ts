import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { OrderStatus } from './enums/order-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { OrderItem } from './order-item.entity';
import { User } from './user.entity';

@Entity('orders')
@Check('CK_orders_subtotal_non_negative', '"subtotal_amount" >= 0')
@Check('CK_orders_shipping_non_negative', '"shipping_amount" >= 0')
@Check('CK_orders_total_non_negative', '"total_amount" >= 0')
@Index('IX_orders_user_id', ['userId'])
@Index('IX_orders_status_created', ['status', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @Column({ type: 'varchar', length: 120, name: 'order_number', unique: true })
  orderNumber!: string;

  @Column({ type: 'varchar', length: 20, name: 'status', default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'payment_method',
    default: PaymentMethod.CASH_ON_DELIVERY
  })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'subtotal_amount' })
  subtotalAmount!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'shipping_amount', default: 0 })
  shippingAmount!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_amount' })
  totalAmount!: string;

  @Column({ type: 'varchar', length: 120, name: 'shipping_full_name' })
  shippingFullName!: string;

  @Column({ type: 'varchar', length: 20, name: 'shipping_phone' })
  shippingPhone!: string;

  @Column({ type: 'varchar', length: 300, name: 'shipping_address_line1' })
  shippingAddressLine1!: string;

  @Column({ type: 'varchar', length: 300, name: 'shipping_address_line2', nullable: true })
  shippingAddressLine2!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'shipping_city' })
  shippingCity!: string;

  @Column({ type: 'varchar', length: 100, name: 'shipping_state' })
  shippingState!: string;

  @Column({ type: 'varchar', length: 20, name: 'shipping_postal_code' })
  shippingPostalCode!: string;

  @Column({ type: 'varchar', length: 100, name: 'shipping_country' })
  shippingCountry!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items!: OrderItem[];
}
