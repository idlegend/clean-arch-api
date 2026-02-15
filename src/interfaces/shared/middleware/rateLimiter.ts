import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // 5 attempts
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});
