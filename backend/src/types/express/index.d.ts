import { UserRole } from '../../entities/enums/user-role.enum';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      auth?: {
        userId: number;
        role: UserRole;
        sessionId: string;
      };
    }
  }
}

export {};
