import { UserRepository } from "../../domain/repositories/UserRepository";
import { AppError } from "../../interfaces/shared/errors/AppError";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../../interfaces/shared/utils/jwt";

export class LoginUser {
    constructor(private userRepository: UserRepository) { }

    async execute(email: string, password: string,
        meta?: { userAgent?: string; ipAddress?: string }) {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new AppError("Invalid credentials", 401);
        }

         // ✅ create per-device session id
    const sessionId = randomUUID();


        const payload = {
            userId: user.id,
            role: user.role,
            sessionId,
        };

        const accessToken = generateAccessToken(payload);
        
   
        const refreshToken = generateRefreshToken(payload);

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.userRepository.createSession({
            id: sessionId,
            userId: user.id,
            refreshToken: hashedRefreshToken,
            userAgent: meta?.userAgent,
            ipAddress: meta?.ipAddress,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          
        return {
            accessToken,
            refreshToken,
        };
    }
}
