import express from "express";
import dotenv from "dotenv";
import { PostgresUserRepository } from "./infrastructure/repositories/PostgresUserRepository";
import { RegisterUser } from "./application/use-cases/RegisterUser";
import { UserController } from "./interfaces/controllers/UserController";

dotenv.config();

const app = express();
app.use(express.json());

const userRepository = new PostgresUserRepository();
const registerUser = new RegisterUser(userRepository);
const userController = new UserController(registerUser);

app.post("/api/register", (req, res) =>
  userController.register(req, res)
);

app.listen(3000, () => console.log("Server running on 3000"));
