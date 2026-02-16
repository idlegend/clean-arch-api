"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const AppError_1 = require("../../interfaces/shared/errors/AppError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../../interfaces/shared/utils/jwt");
class RefreshToken {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(refreshToken) {
        if (!refreshToken) {
            throw new AppError_1.AppError("Refresh token required", 401);
        }
        let decoded;
        try {
            decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new AppError_1.AppError("Invalid refresh token", 403);
        }
        const user = await this.userRepository.findById(decoded.userId);
        if (!user || !user.refreshToken) {
            throw new AppError_1.AppError("Access denied", 403);
        }
        const tokenMatch = await bcrypt_1.default.compare(refreshToken, user.refreshToken);
        if (!tokenMatch) {
            // Possible token reuse attack
            await this.userRepository.updateRefreshToken(user.id, "");
            throw new AppError_1.AppError("Token reuse detected", 403);
        }
        // Generate new tokens (ROTATION)
        const newAccessToken = (0, jwt_1.generateAccessToken)({
            userId: user.id,
            role: user.role,
        });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({
            userId: user.id,
            role: user.role,
        });
        const hashedNewRefresh = await bcrypt_1.default.hash(newRefreshToken, 10);
        await this.userRepository.updateRefreshToken(user.id, hashedNewRefresh);
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}
exports.RefreshToken = RefreshToken;
