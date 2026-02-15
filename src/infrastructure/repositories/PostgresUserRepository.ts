import { UserRepository, CreateSessionInput, SessionRecord } from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";
import { prisma } from "../database/prisma";

export class PostgresUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.createdAt
    );
  }

  async save(user: User): Promise<User> {
    const saved = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

    return new User(
      saved.id,
      saved.name,
      saved.email,
      saved.password,
      saved.role,
      saved.createdAt
    );
  }

  async updateRefreshToken(_userId: string, _token: string): Promise<void> {
    // refresh tokens are now stored per-session, not on user
    return;
  }
  
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
  
    if (!user) return null;
  
    return new User(
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.createdAt
    );
  }

  async createSession(input: CreateSessionInput): Promise<void> {
    await prisma.session.create({
      data: {
        id: input.id,
        userId: input.userId,
        refreshToken: input.refreshToken,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
        expiresAt: input.expiresAt,
      },
    });
  }

  async findSessionById(id: string): Promise<SessionRecord | null> {
    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) return null;

    return {
      id: session.id,
      userId: session.userId,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  }

  async updateSessionRefreshToken(id: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await prisma.session.update({
      where: { id },
      data: { refreshToken, expiresAt },
    });
  }

  async deleteSession(id: string): Promise<void> {
    await prisma.session.delete({ where: { id } });
  }

  async deleteAllSessionsForUser(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
  }

}
