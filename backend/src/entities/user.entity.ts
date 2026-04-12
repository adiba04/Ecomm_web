import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { PasswordResetCode } from './password-reset-code.entity';
import { UserRole } from './enums/user-role.enum';

@Entity('users')
@Index('UQ_users_email', ['email'], { unique: true })
@Index('IX_users_role_locked', ['role', 'isLocked'])
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'varchar', length: 120, name: 'full_name' })
  fullName!: string;

  @Column({ type: 'varchar', length: 180, name: 'email' })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'role',
    default: UserRole.CUSTOMER
  })
  role!: UserRole;

  @Column({ type: 'boolean', name: 'is_locked', default: false })
  isLocked!: boolean;

  @Column({ type: 'datetime', name: 'last_login_at', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ type: 'datetime', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart!: Cart;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => PasswordResetCode, (resetCode) => resetCode.user)
  passwordResetCodes!: PasswordResetCode[];
}
