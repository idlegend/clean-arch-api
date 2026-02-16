"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PostgresUserRepository_1 = require("../infrastructure/repositories/PostgresUserRepository");
const RegisterUser_1 = require("../application/use-cases/RegisterUser");
const LoginUser_1 = require("../application/use-cases/LoginUser");
const RefreshToken_1 = require("../application/use-cases/RefreshToken");
const LogoutUser_1 = require("../application/use-cases/LogoutUser");
const UserController_1 = require("../interfaces/controllers/UserController");
const asyncHandler_1 = require("../interfaces/shared/middleware/asyncHandler");
const rateLimiter_1 = require("../interfaces/shared/middleware/rateLimiter");
const authMiddleware_1 = require("../interfaces/shared/middleware/authMiddleware");
const roleMiddleware_1 = require("../interfaces/shared/middleware/roleMiddleware");
const jwt_1 = require("../interfaces/shared/utils/jwt");
const router = (0, express_1.Router)();
const userRepository = new PostgresUserRepository_1.PostgresUserRepository();
const registerUser = new RegisterUser_1.RegisterUser(userRepository);
const loginUser = new LoginUser_1.LoginUser(userRepository);
const userController = new UserController_1.UserController(registerUser, loginUser);
const refreshUseCase = new RefreshToken_1.RefreshToken(userRepository);
const logoutUseCase = new LogoutUser_1.LogoutUser(userRepository);
// ✅ /api/register
router.post("/register", (0, asyncHandler_1.asyncHandler)((req, res, next) => userController.register(req, res, next)));
// ✅ /api/login
router.post("/login", rateLimiter_1.loginLimiter, (0, asyncHandler_1.asyncHandler)((req, res, next) => userController.login(req, res, next)));
// ✅ /api/profile
router.get("/profile", authMiddleware_1.authenticate, (req, res) => {
    return res.json({ success: true, user: req.user });
});
// ✅ /api/admin
router.get("/admin", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)(["ADMIN"]), (_req, res) => {
    return res.json({ message: "Admin access granted" });
});
// ✅ /api/refresh  (refresh token from cookie, rotate cookie, return access token only)
router.post("/refresh", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    const tokens = await refreshUseCase.execute(refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
        success: true,
        data: { accessToken: tokens.accessToken },
    });
}));
// ✅ /api/logout (works even if access token expired; uses access or refresh cookie to locate user)
router.post("/logout", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const auth = req.headers.authorization;
    const accessToken = auth && auth.startsWith("Bearer ") ? auth.split(" ")[1] : undefined;
    const refreshToken = req.cookies?.refreshToken;
    let userId;
    if (accessToken) {
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(accessToken);
            userId = decoded.userId;
        }
        catch {
            // ignore
        }
    }
    if (!userId && refreshToken) {
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
            userId = decoded.userId;
        }
        catch {
            // ignore
        }
    }
    if (userId) {
        await logoutUseCase.execute(userId, accessToken);
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.json({
        success: true,
        message: "Logged out successfully",
    });
}));
exports.default = router;
