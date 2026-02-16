"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = void 0;
const User_1 = require("../../domain/entities/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const AppError_1 = require("../../interfaces/shared/errors/AppError");
class RegisterUser {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(name, email, password) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError_1.AppError("User already exists", 409);
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = new User_1.User((0, crypto_1.randomUUID)(), name, email, hashedPassword, "USER", new Date());
        user.validateEmail();
        return this.userRepository.save(user);
    }
}
exports.RegisterUser = RegisterUser;
