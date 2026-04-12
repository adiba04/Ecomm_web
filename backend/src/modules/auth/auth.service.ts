import { MoreThan, IsNull } from 'typeorm';
import { AppDataSource } from '../../config/data-source';
import { env } from '../../config/env';
import { Cart } from '../../entities/cart.entity';
import { UserRole } from '../../entities/enums/user-role.enum';
import { PasswordResetCode } from '../../entities/password-reset-code.entity';
import { User } from '../../entities/user.entity';
import { sessionStore } from '../../security/sessionStore';
import { ApiError } from '../../utils/api-error';
import { comparePassword, hashPassword } from '../../utils/password';
import { isStrongPassword } from '../../utils/validation';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ResetPasswordInput {
  code: string;
  newPassword: string;
}

interface UpdateProfileInput {
  fullName?: string;
  email?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface AuthUserSafe {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isLocked: boolean;
}

export class AuthService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly cartRepository = AppDataSource.getRepository(Cart);
  private readonly resetCodeRepository = AppDataSource.getRepository(PasswordResetCode);

  async register(input: RegisterInput): Promise<AuthUserSafe> {
    const normalizedEmail = input.email.toLowerCase();
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id']
    });

    if (existingUser) {
      throw new ApiError(409, 'Email is already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = this.userRepository.create({
      fullName: input.fullName,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.CUSTOMER,
      isLocked: false,
      lastLoginAt: null
    });

    const savedUser = await this.userRepository.save(user);

    const cart = this.cartRepository.create({ userId: savedUser.id });
    await this.cartRepository.save(cart);

    return this.toSafeUser(savedUser);
  }

  async login(input: LoginInput): Promise<{ user: AuthUserSafe; sessionId: string }> {
    const normalizedEmail = input.email.toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'fullName', 'email', 'passwordHash', 'role', 'isLocked']
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.isLocked) {
      throw new ApiError(423, 'Account is locked');
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const session = sessionStore.createSession({
      userId: user.id,
      role: user.role,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    });

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return {
      user: this.toSafeUser(user),
      sessionId: session.sessionId
    };
  }

  async forgotPassword(email: string): Promise<{ code: string | null; expiresInMinutes: number | null }> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      select: ['id', 'isLocked']
    });

    if (!user || user.isLocked) {
      return {
        code: null,
        expiresInMinutes: null
      };
    }

    await this.resetCodeRepository.delete({ userId: user.id });

    const code = await this.generateUniqueResetCode();
    const expiresAt = new Date(Date.now() + env.passwordResetCodeTtlMinutes * 60 * 1000);

    const resetCode = this.resetCodeRepository.create({
      userId: user.id,
      code,
      expiresAt,
      usedAt: null
    });

    await this.resetCodeRepository.save(resetCode);

    return {
      code,
      expiresInMinutes: env.passwordResetCodeTtlMinutes
    };
  }

  async getCurrentUser(userId: number): Promise<AuthUserSafe> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'fullName', 'email', 'role', 'isLocked']
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return this.toSafeUser(user);
  }

  async updateProfile(userId: number, input: UpdateProfileInput): Promise<AuthUserSafe> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'fullName', 'email', 'role', 'isLocked']
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (typeof input.fullName === 'string') {
      user.fullName = input.fullName;
    }

    if (typeof input.email === 'string') {
      const existing = await this.userRepository.findOne({
        where: { email: input.email },
        select: ['id']
      });

      if (existing && existing.id !== user.id) {
        throw new ApiError(409, 'Email is already registered');
      }

      user.email = input.email;
    }

    const saved = await this.userRepository.save(user);
    return this.toSafeUser(saved);
  }

  async changePassword(userId: number, input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash', 'isLocked']
    });

    if (!user || user.isLocked) {
      throw new ApiError(404, 'User not found');
    }

    const matches = await comparePassword(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    if (!isStrongPassword(input.newPassword)) {
      throw new ApiError(400, 'Password does not meet complexity requirements');
    }

    user.passwordHash = await hashPassword(input.newPassword);
    await this.userRepository.save(user);

    sessionStore.revokeSessionsByUser(user.id);
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    if (!isStrongPassword(input.newPassword)) {
      throw new ApiError(400, 'Password does not meet complexity requirements');
    }

    const now = new Date();

    const resetCode = await this.resetCodeRepository.findOne({
      where: {
        code: input.code,
        usedAt: IsNull(),
        expiresAt: MoreThan(now)
      }
    });

    if (!resetCode) {
      throw new ApiError(400, 'Invalid or expired reset code');
    }

    const user = await this.userRepository.findOne({
      where: { id: resetCode.userId },
      select: ['id', 'isLocked']
    });

    if (!user || user.isLocked) {
      throw new ApiError(400, 'Invalid reset request');
    }

    const passwordHash = await hashPassword(input.newPassword);
    await this.userRepository.update(user.id, { passwordHash });

    resetCode.usedAt = new Date();
    await this.resetCodeRepository.save(resetCode);

    sessionStore.revokeSessionsByUser(user.id);
  }

  async lockAccount(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'isLocked']
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.isLocked) {
      user.isLocked = true;
      await this.userRepository.save(user);
    }

    sessionStore.revokeSessionsByUser(user.id);
  }

  async unlockAccount(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'isLocked']
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isLocked) {
      user.isLocked = false;
      await this.userRepository.save(user);
    }
  }

  private async generateUniqueResetCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const existing = await this.resetCodeRepository.findOne({ where: { code }, select: ['id'] });
      if (!existing) {
        return code;
      }
    }

    throw new ApiError(500, 'Could not generate reset code');
  }

  private toSafeUser(user: Pick<User, 'id' | 'fullName' | 'email' | 'role' | 'isLocked'>): AuthUserSafe {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isLocked: user.isLocked
    };
  }
}

export const authService = new AuthService();
