import { UserRepository } from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AppError } from "../../interfaces/shared/errors/AppError";

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User(
      randomUUID(),
      name,
      email,
      hashedPassword,
      "USER", 
      new Date()
    );

    user.validateEmail();

    return this.userRepository.save(user);
  }
}
