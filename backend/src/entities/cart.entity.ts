import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { User } from './user.entity';

@Entity('carts')
@Index('UQ_carts_user_id', ['userId'], { unique: true })
export class Cart {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items!: CartItem[];
}
