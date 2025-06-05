// import local modules
import { asyncHandler } from "../../../../utils/async-handler.js";
import { User } from "../user/user.models.js";
import { APIError } from "../../../error.api.js";
import { APIResponse } from "../../../response.api.js";
import { sendMail } from "../../../../utils/mail/send.mail.js";
import { roleUpdateConfirmationMailContentGenerator } from "../../../../utils/mail/genContent.mail.js";
import { UserRolesEnum, AvailableUserRoles } from "../../../../utils/constants.js";

// @sub-controllers for /get-all-users
const userTypes = {
  all: async () => await User.find({}).select("-password -__v -refreshToken -updatedAt"),
  admin: async () =>
    await User.find({ role: UserRolesEnum.ADMIN }).select(
      "-password -__v -refreshToken -updatedAt",
    ),
  problem_manager: async () =>
    await User.find({ role: UserRolesEnum.PROBLEM_MANAGER }).select(
      "-password -__v -refreshToken -updatedAt",
    ),
  verified_user: async () =>
    await User.find({ isEmailVerified: true, role: UserRolesEnum.USER }).select(
      "-password -__v -refreshToken -updatedAt",
    ),
  unverified_user: async () =>
    await User.find({ isEmailVerified: false, role: UserRolesEnum.USER }).select(
      "-password -__v -refreshToken -updatedAt",
    ),
};

// @controller POST /get-all-users
export const getAllUsers = asyncHandler(async (req, res) => {
  // get userType from body
  const { userType } = req.body;

  // get the required users
  const allUsers = await userTypes[userType]();

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, `${userType.toUpperCase()} users fetched successfully`, allUsers));
});

// @controller GET /get-all-roles
export const getAllRoles = asyncHandler(async (_, res) => {
  // success status to user
  return res.status(200).json(
    new APIResponse(200, "All roles fetched successfully", {
      roles: AvailableUserRoles,
    }),
  );
});

// @controller PATCH /update-user-role/:userId
export const updateUserRole = asyncHandler(async (req, res) => {
  // get userId from params
  const { userId } = req.params;

  // get role from body
  const { role } = req.body;

  // check if userId is valid mongoDB ObjectId
  if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId))
    throw new APIError(400, "Update User Role Error", "Invalid user ID");

  // check if user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) throw new APIError(404, "Update User Role Error", "User not found");

  // check if user is verified
  if (!existingUser.isEmailVerified)
    throw new APIError(403, "Update User Role Error", "User is not verified");

  // check is user is trying to update their own role
  if (existingUser._id.toString() === req.user.id.toString())
    throw new APIError(403, "Update User Role Error", "You cannot update your own role");

  // check if user is already in the given role
  if (existingUser.role === role)
    throw new APIError(
      409,
      "Update User Role Error",
      `User already has this role: ${role.toUpperCase()}`,
    );

  // update user role
  existingUser.role = role;

  // update user in db
  await existingUser.save();

  // send role updation confirmation to user in email
  // await sendMail({
  //   email: existingUser.email,
  //   subject: "Role Update Cofirmation - CodeLab",
  //   mailGenContent: roleUpdateConfirmationMailContentGenerator(
  //     existingUser.username,
  //     existingUser.role,
  //   ),
  // });

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "User role updated successfully", {
      _id: existingUser._id,
      role: existingUser.role,
    }),
  );
});
