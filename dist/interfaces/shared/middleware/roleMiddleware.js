"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../errors/AppError");
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError_1.AppError("Forbidden", 403);
        }
        next();
    };
};
exports.authorize = authorize;
