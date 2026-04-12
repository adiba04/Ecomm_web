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
import { CartItem } from './cart-item.entity';
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';
import { SubCategory } from './sub-category.entity';
import { Type } from './type.entity';

@Entity('products')
@Check('CK_products_price_non_negative', '"price" >= 0')
@Check('CK_products_stock_non_negative', '"stock_quantity" >= 0')
@Index('UQ_products_slug', ['slug'], { unique: true })
@Index('UQ_products_sku', ['sku'], { unique: true })
@Index('IX_products_name', ['name'])
@Index('IX_products_type_category_sub_category', ['typeId', 'categoryId', 'subCategoryId'])
@Index('IX_products_is_active_stock', ['isActive', 'stockQuantity'])
export class Product {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'type_id' })
  typeId!: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId!: number;

  @Column({ type: 'int', name: 'sub_category_id' })
  subCategoryId!: number;

  @Column({ type: 'varchar', length: 180, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 220, name: 'slug' })
  slug!: string;

  @Column({ type: 'varchar', length: 80, name: 'sku' })
  sku!: string;

  @Column({ type: 'varchar', length: 2000, name: 'description' })
  description!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'price' })
  price!: string;

  @Column({ type: 'int', name: 'stock_quantity' })
  stockQuantity!: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 500, name: 'image_url', nullable: true })
  imageUrl!: string | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Type, (type) => type.products, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'type_id' })
  type!: Type;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => SubCategory, (subCategory) => subCategory.products, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory!: SubCategory;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];
}
