"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "name is required"),
    email: zod_1.z.string().email("invalid email"),
    password: zod_1.z.string().min(6, "password must be at least 6 chars"),
});
