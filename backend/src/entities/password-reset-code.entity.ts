import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('password_reset_codes')
@Index('UQ_password_reset_codes_code', ['code'], { unique: true })
@Index('IX_password_reset_codes_user_id', ['userId'])
@Index('IX_password_reset_codes_expires_at', ['expiresAt'])
export class PasswordResetCode {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;

  @Column({ type: 'int', name: 'user_id' })
  userId!: number;

  @Column({ type: 'varchar', length: 12, name: 'code' })
  code!: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', name: 'used_at', nullable: true })
  usedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.passwordResetCodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
