import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { AppError } from "../errors/AppError";

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }
    next();
  };
};
