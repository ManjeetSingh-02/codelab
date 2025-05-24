// import package modules
import { Router } from "express";

// import local modules
import { loginUser, registerUser, verifyAccount } from "./user.controllers.js";
import { loginUserValidator, registerUserValidator } from "./user.validators.js";
import { validateSchema } from "../../../utils/route-protector.js";

// create a new router
const userRouter = Router();

// @route POST /register
userRouter.post("/register", validateSchema(registerUserValidator), registerUser);

// @route PATCH /verify-account/:emailVerificationToken
userRouter.patch("/verify-account/:emailVerificationToken", verifyAccount);

// @route POST/login
userRouter.post("/login", validateSchema(loginUserValidator), loginUser);

// export router
export { userRouter };
