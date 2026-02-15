import { User } from "../entities/User";


export type SessionRecord = {
  id: string;
  userId: string;
  refreshToken: string; // hashed
  expiresAt: Date;
};

export type CreateSessionInput = {
  id: string; // sessionId
  userId: string;
  refreshToken: string; // hashed
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
};


export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  updateRefreshToken(userId: string, token: string): Promise<void>;
 findById(id: string): Promise<User | null>;
 createSession(input: CreateSessionInput): Promise<void>;
 findSessionById(id: string): Promise<SessionRecord | null>;
 updateSessionRefreshToken(id: string, refreshToken: string, expiresAt: Date): Promise<void>;
 deleteSession(id: string): Promise<void>;
 deleteAllSessionsForUser(userId: string): Promise<void>;
}
