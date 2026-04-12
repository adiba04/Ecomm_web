import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity('types')
@Index('UQ_types_slug', ['slug'], { unique: true })
@Index('UQ_types_name', ['name'], { unique: true })
export class Type {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'varchar', length: 120, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 140, name: 'slug' })
  slug!: string;

  @Column({ type: 'varchar', length: 300, name: 'description', nullable: true })
  description!: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Category, (category) => category.type)
  categories!: Category[];

  @OneToMany(() => Product, (product) => product.type)
  products!: Product[];
}
