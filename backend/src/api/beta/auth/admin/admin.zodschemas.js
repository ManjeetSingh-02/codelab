// import package modules
import { z } from "zod";

// import local modules
import { AvailableUserStates, UserRolesEnum } from "../../../../utils/constants.js";

// zod schema for user type
const userStateSchema = z.enum(AvailableUserStates);

// zod schema for getAllUsers
export const getAllUsersSchema = z.object({
  userType: userStateSchema,
});

// zod schema for updateUserRole
export const updateUserRoleSchema = z.object({
  role: z.enum([UserRolesEnum.PROBLEM_MANAGER, UserRolesEnum.USER]),
});
