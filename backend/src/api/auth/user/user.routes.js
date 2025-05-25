// import package modules
import { Router } from "express";

// import local modules
import {
  forgotPasswordRequest,
  loginUser,
  refreshAccessToken,
  registerUser,
  resendVerificationEmail,
  resetForgottenPassword,
  verifyAccount,
} from "./user.controllers.js";
import {
  forgotPasswordEmailSchema,
  loginUserSchema,
  registerUserSchema,
  resetForgottenPasswordSchema,
} from "./user.zodschemas.js";
import { isLoggedIn, validateSchema } from "../../../utils/route-protector.js";

// create a new router
const userRouter = Router();

//                          --------------------------
//                              UNPROTECTED ROUTES
//                          --------------------------

// @route POST /register
userRouter.post("/register", validateSchema(registerUserSchema), registerUser);

// @route PATCH /verify-account/:emailVerificationToken
userRouter.patch("/verify-account/:emailVerificationToken", verifyAccount);

// @route POST/login
userRouter.post("/login", validateSchema(loginUserSchema), loginUser);

// @route POST /forgot-password
userRouter.post(
  "/forgot-password",
  validateSchema(forgotPasswordEmailSchema),
  forgotPasswordRequest,
);

// @route PATCH /reset-password/:resetPasswordToken
userRouter.patch(
  "/reset-password/:resetPasswordToken",
  validateSchema(resetForgottenPasswordSchema),
  resetForgottenPassword,
);

// @route PATCH /refresh-access-token
userRouter.patch("/refresh-access-token", refreshAccessToken);

//                          --------------------------
//                              PROTECTED ROUTES
//                          --------------------------

// @route POST /resend-verification-email
userRouter.post("/resend-verification-email", isLoggedIn, resendVerificationEmail);

// @route GET /profile
userRouter.get("/profile", isLoggedIn);

// @route PATCH /update-avatar
userRouter.patch("/update-avatar", isLoggedIn);

// @route PATCH /update-profile
userRouter.patch("/update-profile", isLoggedIn);

// @route PATCH /update-password
userRouter.patch("/update-password", isLoggedIn);

// @route DELETE /delete-account
userRouter.delete("/delete-account", isLoggedIn);

// @route POST /logout
userRouter.post("/logout", isLoggedIn);

// export router
export { userRouter };
