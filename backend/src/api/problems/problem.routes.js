// import package modules
import { Router } from "express";

// import local modules
import { getAllProblems, getOneProblem } from "./user/user.controllers.js";
import { createProblem } from "./problem_manager/problem_manager.controllers.js";
import {
  hasRequiredRole,
  isLoggedIn,
  isVerified,
  validateSchema,
} from "../../utils/route-protector.js";
import { createProblemSchema } from "./problem.zodschemas.js";
import { UserRolesEnum } from "../../utils/constants.js";

// create a new router
const router = Router();

// @route GET /
router.get("/", getAllProblems);

// @route GET /:problemSlug
router.get("/:problemSlug", getOneProblem);

// @route POST /
router.post(
  "/",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.PROBLEM_MANAGER]),
  validateSchema(createProblemSchema),
  createProblem,
);

// export router
export default router;
