import {
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
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('sub_categories')
@Index('UQ_sub_categories_category_slug', ['categoryId', 'slug'], { unique: true })
@Index('UQ_sub_categories_category_name', ['categoryId', 'name'], { unique: true })
@Index('IX_sub_categories_category_id', ['categoryId'])
export class SubCategory {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId!: number;

  @Column({ type: 'varchar', length: 120, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 140, name: 'slug' })
  slug!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.subCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => Product, (product) => product.subCategory)
  products!: Product[];
}
