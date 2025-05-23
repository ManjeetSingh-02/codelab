// import package modules
import { z } from "zod";

// zod validator to validate email
export const emailValidator = z
  .string()
  .email({ message: "Invalid email address" })
  .trim()
  .toLowerCase()
  .nonempty({ message: "Email is required" });

// zod validator to validate password
export const passwordValidator = z
  .string()
  .nonempty({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" });

// zod validator to validate registerUser
export const registerUserValidator = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty({ message: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(10, { message: "Username must be at most 10 characters long" }),
  email: emailValidator,
  password: passwordValidator,
  fullname: z
    .string()
    .trim()
    .nonempty({ message: "Full name is required" })
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(20, { message: "Full name must be at most 20 characters long" }),
});

// zod validator to validate loginUser
export const loginUserValidator = z.object({
  email: emailValidator,
  password: passwordValidator,
});
