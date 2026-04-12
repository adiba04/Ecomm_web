import crypto from 'crypto';
import { env } from '../config/env';
import { UserRole } from '../entities/enums/user-role.enum';

export interface SessionData {
  sessionId: string;
  userId: number;
  role: UserRole;
  createdAt: number;
  expiresAt: number;
  lastSeenAt: number;
  ipAddress?: string;
  userAgent?: string;
}

interface CreateSessionInput {
  userId: number;
  role: UserRole;
  ipAddress?: string;
  userAgent?: string;
}

class SessionStore {
  private readonly sessions = new Map<string, SessionData>();
  private readonly ttlMs = env.sessionTtlMinutes * 60 * 1000;

  createSession(input: CreateSessionInput): SessionData {
    const now = Date.now();
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session: SessionData = {
      sessionId,
      userId: input.userId,
      role: input.role,
      createdAt: now,
      expiresAt: now + this.ttlMs,
      lastSeenAt: now,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  touchSession(sessionId: string): SessionData | null {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    const now = Date.now();
    session.lastSeenAt = now;
    session.expiresAt = now + this.ttlMs;
    this.sessions.set(sessionId, session);

    return session;
  }

  revokeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  revokeSessionsByUser(userId: number): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }

  clearExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const sessionStore = new SessionStore();
