// import package modules
import { Router } from "express";

// import local modules
import { getAllRoles, getAllUsers, updateUserRole } from "./admin.controllers.js";
import { getAllUsersSchema, updateUserRoleSchema } from "./admin.zodschemas.js";
import { UserRolesEnum } from "../../../../utils/constants.js";
import {
  hasRequiredRole,
  isLoggedIn,
  isVerified,
  validateSchema,
} from "../../../../utils/route-protector.js";

// create a new router
const adminRouter = Router();

//                          --------------------------
//                              PROTECTED ROUTES
//                          --------------------------

// @route POST /get-all-users
adminRouter.post(
  "/get-all-users",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN]),
  validateSchema(getAllUsersSchema),
  getAllUsers,
);

// @route GET /get-all-roles
adminRouter.get(
  "/get-all-roles",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN]),
  getAllRoles,
);

// @route PATCH /update-user-role/:userId
adminRouter.patch(
  "/update-user-role/:userId",
  isLoggedIn,
  isVerified,
  hasRequiredRole([UserRolesEnum.ADMIN]),
  validateSchema(updateUserRoleSchema),
  updateUserRole,
);

// export router
export { adminRouter };
