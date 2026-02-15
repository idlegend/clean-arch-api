import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";
import { redis } from "../utils/redis";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const blacklisted = await redis.get(`bl_${token}`);
    if (blacklisted) {
      return next(new AppError("Token blacklisted", 401));
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
   return next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};
