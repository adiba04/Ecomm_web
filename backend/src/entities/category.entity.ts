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
import { Product } from './product.entity';
import { SubCategory } from './sub-category.entity';
import { Type } from './type.entity';

@Entity('categories')
@Index('UQ_categories_type_slug', ['typeId', 'slug'], { unique: true })
@Index('UQ_categories_type_name', ['typeId', 'name'], { unique: true })
@Index('IX_categories_type_id', ['typeId'])
export class Category {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'type_id' })
  typeId!: number;

  @Column({ type: 'varchar', length: 120, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 140, name: 'slug' })
  slug!: string;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Type, (type) => type.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'type_id' })
  type!: Type;

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories!: SubCategory[];

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}
