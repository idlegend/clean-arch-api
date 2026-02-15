import express from "express";
import dotenv from "dotenv";
import { PostgresUserRepository } from "./infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "./application/use-cases/RegisterUser";
import { UserController } from "./interfaces/controllers/UserController";
import { errorHandler } from "./interfaces/shared/middleware/errorHandler";
import { asyncHandler } from "./interfaces/shared/middleware/asyncHandler";
dotenv.config();

const app = express();
app.use(express.json());


const userRepository = new PostgresUserRepository();
const registerUser = new RegisterUser(userRepository);
const userController = new UserController(registerUser);

app.post(
  "/api/register",
  asyncHandler((req: any, res: any, next: any) =>
    userController.register(req, res, next)
  )
);

app.use(errorHandler);

app.listen(3000, () => console.log("Server running on 3000"));
