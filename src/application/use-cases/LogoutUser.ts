import { UserRepository } from "../../domain/repositories/UserRepository";
import { redis } from "../../interfaces/shared/utils/redis";
import { AppError } from "../../interfaces/shared/errors/AppError";

// export class LogoutUser {
//     constructor(private userRepository: UserRepository) {}
  
//     async execute(userId: string, accessToken: string) {
//       // clear sessions (or user refresh field if you're still using it)
//       await this.userRepository.deleteAllSessionsForUser(userId); 
//       // If you DON'T have sessions and still use refreshToken on User table, use:
//       await this.userRepository.updateRefreshToken(userId, "");
  
//       if (!accessToken) throw new AppError("Access token required", 400);
  
//       // blacklist access token for remaining lifetime (example 15 mins)
//       await redis.set(`bl_${accessToken}`, "blacklisted", "EX", 900);
//     }
//   }

export class LogoutUser {
    constructor(private userRepository: UserRepository) {}
  
    async execute(userId: string, accessToken?: string) {
      // sessions-based logout (kills all devices for this user)
      await this.userRepository.deleteAllSessionsForUser(userId);
  
      if (accessToken) {
        try {
          await redis.set(`bl_${accessToken}`, "blacklisted", "EX", 900); // 15 mins
        } catch {
          // don't crash logout if redis is down
        }
      }
    }
  }
