import { Request, Response } from "express";
import { RegisterUser } from "../../application/use-cases/RegisterUser";
import { RegisterSchema } from "../validators/RegisterValidator";

export class UserController {
  constructor(private registerUser: RegisterUser) {}

  async register(req: Request, res: Response) {
    try {
      const validated = RegisterSchema.parse(req.body);

      const user = await this.registerUser.execute(
        validated.name,
        validated.email,
        validated.password
      );

      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
