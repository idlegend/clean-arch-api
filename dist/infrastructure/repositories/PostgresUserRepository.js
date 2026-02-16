"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresUserRepository = void 0;
const User_1 = require("../../domain/entities/User");
const prisma_1 = require("../database/prisma");
class PostgresUserRepository {
    async findByEmail(email) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user)
            return null;
        return new User_1.User(user.id, user.name, user.email, user.password, user.role, user.createdAt);
    }
    async save(user) {
        const saved = await prisma_1.prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
        return new User_1.User(saved.id, saved.name, saved.email, saved.password, saved.role, saved.createdAt);
    }
    async updateRefreshToken(_userId, _token) {
        // refresh tokens are now stored per-session, not on user
        return;
    }
    async findById(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            return null;
        return new User_1.User(user.id, user.name, user.email, user.password, user.role, user.createdAt);
    }
    async createSession(input) {
        await prisma_1.prisma.session.create({
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
    async findSessionById(id) {
        const session = await prisma_1.prisma.session.findUnique({ where: { id } });
        if (!session)
            return null;
        return {
            id: session.id,
            userId: session.userId,
            refreshToken: session.refreshToken,
            expiresAt: session.expiresAt,
        };
    }
    async updateSessionRefreshToken(id, refreshToken, expiresAt) {
        await prisma_1.prisma.session.update({
            where: { id },
            data: { refreshToken, expiresAt },
        });
    }
    async deleteSession(id) {
        await prisma_1.prisma.session.delete({ where: { id } });
    }
    async deleteAllSessionsForUser(userId) {
        await prisma_1.prisma.session.deleteMany({ where: { userId } });
    }
}
exports.PostgresUserRepository = PostgresUserRepository;
