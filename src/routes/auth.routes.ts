import { Router } from "express";
import { PostgresUserRepository } from "../infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "../application/use-cases/RegisterUser";
import { LoginUser } from "../application/use-cases/LoginUser";
import { RefreshToken } from "../application/use-cases/RefreshToken";
import { LogoutUser } from "../application/use-cases/LogoutUser";
import { UserController } from "../interfaces/controllers/UserController";
import { asyncHandler } from "../interfaces/shared/middleware/asyncHandler";
import { loginLimiter } from "../interfaces/shared/middleware/rateLimiter";
import { authenticate } from "../interfaces/shared/middleware/authMiddleware";
import { authorize } from "../interfaces/shared/middleware/roleMiddleware";
import { verifyAccessToken, verifyRefreshToken } from "../interfaces/shared/utils/jwt";

const router = Router();

const userRepository = new PostgresUserRepository();
const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository);
const userController = new UserController(registerUser, loginUser);
const refreshUseCase = new RefreshToken(userRepository);
const logoutUseCase = new LogoutUser(userRepository);

// ✅ /api/register
router.post(
  "/register",
  asyncHandler((req: any, res: any, next: any) =>
    userController.register(req, res, next)
  )
);

// ✅ /api/login
router.post(
  "/login",
  loginLimiter,
  asyncHandler((req: any, res: any, next: any) =>
    userController.login(req, res, next)
  )
);

// ✅ /api/profile
router.get(
  "/profile",
  authenticate,
  (req: any, res: any) => {
    return res.json({ success: true, user: req.user });
  }
);

// ✅ /api/admin
router.get(
  "/admin",
  authenticate,
  authorize(["ADMIN"]),
  (_req: any, res: any) => {
    return res.json({ message: "Admin access granted" });
  }
);

// ✅ /api/refresh  (refresh token from cookie, rotate cookie, return access token only)
router.post(
  "/refresh",
  asyncHandler(async (req: any, res: any) => {
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
  })
);

// ✅ /api/logout (works even if access token expired; uses access or refresh cookie to locate user)
router.post(
  "/logout",
  asyncHandler(async (req: any, res: any) => {
    const auth = req.headers.authorization as string | undefined;
    const accessToken =
      auth && auth.startsWith("Bearer ") ? auth.split(" ")[1] : undefined;

    const refreshToken = req.cookies?.refreshToken as string | undefined;

    let userId: string | undefined;

    if (accessToken) {
      try {
        const decoded: any = verifyAccessToken(accessToken);
        userId = decoded.userId;
      } catch {
        // ignore
      }
    }

    if (!userId && refreshToken) {
      try {
        const decoded: any = verifyRefreshToken(refreshToken);
        userId = decoded.userId;
      } catch {
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
  })
);

export default router;
