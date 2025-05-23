// import package modules
import { Router } from "express";

// import local modules
import { registerUser } from "./user.controllers.js";
import { registerUserValidator } from "./user.validators.js";
import { validateSchema } from "../../utils/route-protector.js";

// create a new router
const router = Router();

// @route POST /register
router.post("/register", validateSchema(registerUserValidator), registerUser);

// export router
export default router;
