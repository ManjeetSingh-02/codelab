// import package modules
import { Router } from "express";

// import local modules
import { registerUser, verifyAccount } from "./user.controllers.js";
import { registerUserValidator } from "./user.validators.js";
import { validateSchema } from "../../../utils/route-protector.js";

// create a new router
const userRouter = Router();

// @route POST /register
userRouter.post("/register", validateSchema(registerUserValidator), registerUser);

// @route PATCH /verify-account/:emailVerificationToken
userRouter.patch("/verify-account/:emailVerificationToken", verifyAccount);

// export router
export { userRouter };
