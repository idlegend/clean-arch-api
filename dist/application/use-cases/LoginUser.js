"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = void 0;
const AppError_1 = require("../../interfaces/shared/errors/AppError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const jwt_1 = require("../../interfaces/shared/utils/jwt");
class LoginUser {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(email, password, meta) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AppError_1.AppError("Invalid credentials", 401);
        }
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid) {
            throw new AppError_1.AppError("Invalid credentials", 401);
        }
        // ✅ create per-device session id
        const sessionId = (0, crypto_1.randomUUID)();
        const payload = {
            userId: user.id,
            role: user.role,
            sessionId,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        const hashedRefreshToken = await bcrypt_1.default.hash(refreshToken, 10);
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
exports.LoginUser = LoginUser;
