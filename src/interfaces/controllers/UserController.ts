import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { RegisterSchema } from "../validators/RegisterValidator";

export class UserController {
  constructor(private registerUser: RegisterUser) {}

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
}
