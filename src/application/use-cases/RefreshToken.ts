import { UserRepository } from "../../domain/repositories/UserRepository";
import { AppError } from "../../interfaces/shared/errors/AppError";
import bcrypt from "bcrypt";

import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../interfaces/shared/utils/jwt";

export class RefreshToken {
    constructor(private userRepository: UserRepository) { }

    async execute(refreshToken: string) {
        if (!refreshToken) {
            throw new AppError("Refresh token required", 401);
        }

        let decoded: any;

        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch {
            throw new AppError("Invalid refresh token", 403);
        }

        const user = await this.userRepository.findById(decoded.userId);

        if (!user || !user.refreshToken) {
            throw new AppError("Access denied", 403);
        }

        const tokenMatch = await bcrypt.compare(
            refreshToken,
            user.refreshToken
        );

        if (!tokenMatch) {
            // Possible token reuse attack
            await this.userRepository.updateRefreshToken(user.id, "");
            throw new AppError("Token reuse detected", 403);
        }

        // Generate new tokens (ROTATION)
        const newAccessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
        });

        const newRefreshToken = generateRefreshToken({
            userId: user.id,
            role: user.role,
        });

        const hashedNewRefresh = await bcrypt.hash(newRefreshToken, 10);

        await this.userRepository.updateRefreshToken(
            user.id,
            hashedNewRefresh
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}
