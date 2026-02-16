"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const zod_1 = require("zod");
const RegisterValidator_1 = require("../validators/RegisterValidator");
const LoginValidator_1 = require("../validators/LoginValidator");
class UserController {
    registerUser;
    loginUser;
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
    }
    async register(req, res, next) {
        try {
            const validated = RegisterValidator_1.RegisterSchema.parse(req.body);
            const user = await this.registerUser.execute(validated.name, validated.email, validated.password);
            return res.status(201).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.flatten(),
                });
            }
            return next(error);
        }
    }
    async login(req, res, next) {
        try {
            const validated = LoginValidator_1.LoginSchema.parse(req.body);
            const tokens = await this.loginUser.execute(validated.email, validated.password, {
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip,
            });
            // store refresh token in httpOnly cookie
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            // return ONLY access token
            return res.status(200).json({
                success: true,
                data: { accessToken: tokens.accessToken },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.flatten(),
                });
            }
            return next(error);
        }
    }
}
exports.UserController = UserController;
