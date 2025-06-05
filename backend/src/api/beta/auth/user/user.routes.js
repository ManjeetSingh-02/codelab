// import package modules
import { Router } from "express";

// import local modules
import {
  deleteUser,
  forgotPasswordRequest,
  getLoggedInUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendVerificationEmail,
  resetForgottenPassword,
  updateUserAvatar,
  updateUserCurrentPassword,
  updateUserDetails,
  verifyAccount,
} from "./user.controllers.js";
import {
  forgotPasswordEmailSchema,
  loginUserSchema,
  registerUserSchema,
  resetForgottenPasswordSchema,
  updateUserCurrentPasswordSchema,
  updateUserDetailsSchema,
} from "./user.zodschemas.js";
import { isLoggedIn, isVerified, validateSchema } from "../../../../utils/route-protector.js";
import { uploadImageLocally } from "../../../../utils/imageHandler/multer.imageHandler.js";

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
userRouter.get("/profile", isLoggedIn, isVerified, getLoggedInUserProfile);

// @route PATCH /update-avatar
userRouter.patch(
  "/update-avatar",
  isLoggedIn,
  isVerified,
  uploadImageLocally.single("avatar"),
  updateUserAvatar,
);

// @route PATCH /update-profile
userRouter.patch(
  "/update-profile",
  isLoggedIn,
  isVerified,
  validateSchema(updateUserDetailsSchema),
  updateUserDetails,
);

// @route PATCH /update-password
userRouter.patch(
  "/update-password",
  isLoggedIn,
  isVerified,
  validateSchema(updateUserCurrentPasswordSchema),
  updateUserCurrentPassword,
);

// @route DELETE /delete-account
userRouter.delete("/delete-account", isLoggedIn, isVerified, deleteUser);

// @route POST /logout
userRouter.post("/logout", isLoggedIn, logoutUser);

// export router
export { userRouter };
