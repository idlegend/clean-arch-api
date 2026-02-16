"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../errors/AppError");
const redis_1 = require("../utils/redis");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const blacklisted = await redis_1.redis.get(`bl_${token}`);
        if (blacklisted) {
            return next(new AppError_1.AppError("Token blacklisted", 401));
        }
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        return next();
    }
    catch {
        throw new AppError_1.AppError("Invalid or expired token", 401);
    }
};
exports.authenticate = authenticate;
