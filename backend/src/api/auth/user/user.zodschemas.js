// import package modules
import { z } from "zod";

// zod schema for email
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .nonempty({ message: "Email is required" })
  .email({ message: "Invalid email address" });

// zod schema for password
const passwordSchema = z
  .string()
  .nonempty({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" });

// zod schema for username
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .nonempty({ message: "Username is required" })
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(10, { message: "Username must be at most 10 characters long" });

// zod schema for fullname
const fullnameSchema = z
  .string()
  .trim()
  .nonempty({ message: "Full name is required" })
  .min(3, { message: "Full name must be at least 3 characters long" })
  .max(20, { message: "Full name must be at most 20 characters long" });

// zod schema for registerUser
export const registerUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  fullname: fullnameSchema,
});

// zod schema for loginUser
export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// zod schema for forgot password reset
export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
});

// zod schema for reset forgotten password
export const resetForgottenPasswordSchema = z.object({
  newPassword: passwordSchema,
});

// zod schema for updateUserDetails
export const updateUserDetailsSchema = z.object({
  username: usernameSchema,
  fullname: fullnameSchema,
});

// zod schema for updateUserCurrentPassword
export const updateUserCurrentPasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});
