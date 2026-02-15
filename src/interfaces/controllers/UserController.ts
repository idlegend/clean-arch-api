import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { LoginUser } from "../../application/use-cases/LoginUser";
import { RegisterSchema } from "../validators/RegisterValidator";
import { LoginSchema } from "../validators/LoginValidator";


export class UserController {
  constructor(private registerUser: RegisterUser, private loginUser: LoginUser) { }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = RegisterSchema.parse(req.body);

      const user = await this.registerUser.execute(
        validated.name,
        validated.email,
        validated.password
      );

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.flatten(),
        });
      }
      return next(error);
    }
  }

async login(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = LoginSchema.parse(req.body);

    const tokens = await this.loginUser.execute(
      validated.email,
      validated.password,
      {
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
      }
    );

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
  } catch (error) {
    if (error instanceof ZodError) {
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
