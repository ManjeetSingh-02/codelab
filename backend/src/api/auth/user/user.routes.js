// import package modules
import { Router } from "express";

// import local modules
import {
  forgotPasswordRequest,
  loginUser,
  refreshAccessToken,
  registerUser,
  resetForgottenPassword,
  verifyAccount,
} from "./user.controllers.js";
import {
  forgotPasswordandResendEmailSchema,
  loginUserSchema,
  registerUserSchema,
  resetForgottenPasswordSchema,
} from "./user.zodschemas.js";
import { validateSchema } from "../../../utils/route-protector.js";

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
  validateSchema(forgotPasswordandResendEmailSchema),
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

// export router
export { userRouter };
