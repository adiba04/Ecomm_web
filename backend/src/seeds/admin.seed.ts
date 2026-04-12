import { AppDataSource } from '../config/data-source';
import { env } from '../config/env';
import { UserRole } from '../entities/enums/user-role.enum';
import { User } from '../entities/user.entity';
import { hashPassword } from '../utils/password';

export const ensureAdminSeed = async (): Promise<void> => {
  if (!env.adminSeed.enabled) {
    return;
  }

  const userRepository = AppDataSource.getRepository(User);
  const email = env.adminSeed.email.toLowerCase();
  const passwordHash = await hashPassword(env.adminSeed.password);

  const existingUser = await userRepository.findOne({
    where: { email },
    select: ['id', 'fullName', 'email', 'role', 'isLocked']
  });

  if (!existingUser) {
    const adminUser = userRepository.create({
      fullName: env.adminSeed.fullName,
      email,
      passwordHash,
      role: UserRole.ADMIN,
      isLocked: false,
      lastLoginAt: null
    });

    await userRepository.save(adminUser);
    // eslint-disable-next-line no-console
    console.log(`Admin seed created for ${email}`);
    return;
  }

  await userRepository.update(existingUser.id, {
    fullName: env.adminSeed.fullName,
    passwordHash,
    role: UserRole.ADMIN,
    isLocked: false
  });

  // eslint-disable-next-line no-console
  console.log(`Admin seed refreshed for ${email}`);
};
