// import package modules
import { Router } from "express";

// import local modules
import { getAllProblems, getAllSolvedProblems, getOneProblem } from "./user/user.controllers.js";
import {
  createProblem,
  deleteProblem,
  updateProblemEditorial,
  updateProblemInformation,
  updateProblemTestCasesAndCodeInformations,
} from "./problem_manager/problem_manager.controllers.js";
import {
  hasRequiredRole,
  isLoggedIn,
  isVerified,
  validateSchema,
} from "../../utils/route-protector.js";
import {
  createProblemSchema,
  updateProblemEditorialSchema,
  updateProblemInformationSchema,
  updateProblemTestCasesAndCodeInformationsSchema,
} from "./problem.zodschemas.js";
import { UserRolesEnum } from "../../utils/constants.js";

// create a new router
const router = Router();

// @route GET /
router.get("/", getAllProblems);

// @route GET /solved
router.get("/solved", isLoggedIn, isVerified, getAllSolvedProblems);

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

// route PATCH /:problemSlug/information
router.patch(
  "/:problemSlug/information",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.PROBLEM_MANAGER]),
  validateSchema(updateProblemInformationSchema),
  updateProblemInformation,
);

// @route PATCH /:problemSlug/editorial
router.patch(
  "/:problemSlug/editorial",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.PROBLEM_MANAGER]),
  validateSchema(updateProblemEditorialSchema),
  updateProblemEditorial,
);

// @route PATCH /:problemSlug/testcases-codeinformations
router.patch(
  "/:problemSlug/testcases-codeinformations",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.PROBLEM_MANAGER]),
  validateSchema(updateProblemTestCasesAndCodeInformationsSchema),
  updateProblemTestCasesAndCodeInformations,
);

// @route DELETE /:problemSlug
router.delete(
  "/:problemSlug",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN, UserRolesEnum.PROBLEM_MANAGER]),
  deleteProblem,
);

// export router
export default router;
