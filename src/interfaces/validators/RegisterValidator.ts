import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "name is required"),
  email: z.string().email("invalid email"),
  password: z.string().min(6, "password must be at least 6 chars"),
});
