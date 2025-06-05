// import package modules
import { Router } from "express";

// import local modules
import {
  getAllProblems,
  getAllSolvedProblems,
  getOneProblem,
  runCode,
  submitCode,
} from "./user/user.controllers.js";
import {
  createProblem,
  deleteProblem,
  updateProblemEditorial,
  updateProblemInformation,
  updateProblemTestCasesAndCodeInformations,
} from "./problem_manager/problem_manager.controllers.js";
import {
  executeCode,
  hasRequiredRole,
  isLoggedIn,
  isVerified,
  validateSchema,
} from "../../../utils/route-protector.js";
import {
  createProblemSchema,
  updateProblemEditorialSchema,
  updateProblemInformationSchema,
  updateProblemTestCasesAndCodeInformationsSchema,
} from "./problem.zodschemas.js";
import { UserRolesEnum } from "../../../utils/constants.js";
import { executeCodeSchema } from "./execute-code.zodschemas.js";

// create a new router
const router = Router();

// @route GET /
router.get("/", getAllProblems);

// @route GET /:problemSlug
router.get("/:problemSlug", getOneProblem);

// @route GET /user/solved
router.get("/user/solved", isLoggedIn, isVerified, getAllSolvedProblems);

// @route POST /:problemSlug/run-code
router.post(
  "/:problemSlug/run-code",
  isLoggedIn,
  isVerified,
  validateSchema(executeCodeSchema),
  executeCode,
  runCode,
);

// @route POST /:problemSlug/submit-code
router.post(
  "/:problemSlug/submit-code",
  isLoggedIn,
  isVerified,
  validateSchema(executeCodeSchema),
  executeCode,
  submitCode,
);

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
