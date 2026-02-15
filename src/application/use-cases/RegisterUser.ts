import { UserRepository } from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User(
      randomUUID(),
      name,
      email,
      hashedPassword,
      new Date()
    );

    user.validateEmail();

    return this.userRepository.save(user);
  }
}
