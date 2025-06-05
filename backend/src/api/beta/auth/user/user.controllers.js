// import package modules
import ms from "ms";
import jwt from "jsonwebtoken";

// import local modules
import { envConfig } from "../../../../utils/env.js";
import { asyncHandler } from "../../../../utils/async-handler.js";
import { User } from "./user.models.js";
import { APIError } from "../../../error.api.js";
import { APIResponse } from "../../../response.api.js";
import { sendMail } from "../../../../utils/mail/send.mail.js";
import {
  accountDeletionConfirmationMailContentGenerator,
  forgotPasswordMailContentGenerator,
  passwordChangeConfirmationMailContentGenerator,
  verificationMailContentGenerator,
} from "../../../../utils/mail/genContent.mail.js";
import {
  deleteImageFromCloudinary,
  uploadImageonCloudinary,
} from "../../../../utils/imageHandler/cloudinary.imageHandler.js";

// @controller POST /register
export const registerUser = asyncHandler(async (req, res) => {
  // get data from body
  const { username, email, password, fullname } = req.body;

  // check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser)
    throw new APIError(409, "User Registration Error", [
      "User already exists with this email or username",
    ]);

  // create new user in db
  const newUser = await User.create({
    username,
    email,
    fullname,
    password,
    isEmailVerified: true,
  });
  if (!newUser)
    throw new APIError(500, "User Registration Error", [
      "Something went wrong while registering user",
    ]);

  // generate email verification token and expiry and store in db
  // const { token, tokenExpiry } = newUser.generateTemporaryToken();
  // newUser.emailVerificationToken = token;
  // newUser.emailVerificationExpiry = tokenExpiry;

  // update user in db
  await newUser.save();

  // send emailVerificationToken to user by email
  // await sendMail({
  //   email: newUser.email,
  //   subject: "Verify your account - CodeLab",
  //   mailGenContent: verificationMailContentGenerator(newUser.username, token),
  // });

  // success status to user
  return res.status(201).json(new APIResponse(201, "User registered successfully"));
});

// @controller PATCH /verify-account:emailVerificationToken
export const verifyAccount = asyncHandler(async (req, res) => {
  // get emailVerificationToken from params
  const { emailVerificationToken } = req.params;

  // check if emailVerificationToken is valid
  const existingUser = await User.findOne({ emailVerificationToken });
  if (!existingUser) throw new APIError(400, "Verification Error", "Invalid token");

  // check if emailVerificationToken is expired
  const isTokenExpired = existingUser.emailVerificationExpiry < Date.now();
  if (isTokenExpired)
    throw new APIError(
      400,
      "Verification Error",
      "Token expired, please resend the verification email",
    );

  // mark the user verified and remove the emailVerificationToken and its expiry
  existingUser.isEmailVerified = true;
  existingUser.emailVerificationToken = undefined;
  existingUser.emailVerificationExpiry = undefined;

  // update user in db
  await existingUser.save();

  // success status to user
  return res.status(200).json(new APIResponse(200, "Email verified successfully"));
});

// @controller POST /login
export const loginUser = asyncHandler(async (req, res) => {
  // get data
  const { email, password } = req.body;

  // check if user exists with email and password is correct
  const existingUser = await User.findOne({ email });
  if (!existingUser || !(await existingUser.isPasswordCorrect(password)))
    throw new APIError(401, "Login Error", "Invalid credentials");

  // generate access & refresh token
  const accessToken = existingUser.generateAccessToken();
  const refreshToken = existingUser.generateRefreshToken();

  // store refresh token in db
  existingUser.refreshToken = refreshToken;

  // update user in db
  await existingUser.save({ validateBeforeSave: false });

  // success status to user, save accessToken and refreshToken into cookies and send emailVerification status
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "None",
      maxAge: ms(envConfig.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "None",
      maxAge: ms(envConfig.REFRESH_TOKEN_EXPIRY),
    })
    .json(
      new APIResponse(200, "Login Successful", {
        isEmailVerified: existingUser.isEmailVerified,
      }),
    );
});

// @controller POST /forgot-password
export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  // get email from body
  const { email } = req.body;

  // get user with email
  const existingUser = await User.findOne({ email });

  // if user exist, proceed with password reset
  if (existingUser) {
    // generate new password reset token
    const { token, tokenExpiry } = existingUser.generateTemporaryToken();

    // store in db
    existingUser.forgotPasswordToken = token;
    existingUser.forgotPasswordExpiry = tokenExpiry;

    // update user in db
    await existingUser.save();

    // send resetPasswordToken to user in email
    await sendMail({
      email: existingUser.email,
      subject: "Reset Your Password - CodeLab",
      mailGenContent: forgotPasswordMailContentGenerator(existingUser.username, token),
    });
  }

  // success status to user
  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        "If an account with this email exists, it will receive a password reset email shortly.",
      ),
    );
});

// @controller PATCH /reset-password/:resetPasswordToken
export const resetForgottenPassword = asyncHandler(async (req, res) => {
  // get resetPasswordToken from params
  const { resetPasswordToken } = req.params;

  // get new password
  const { newPassword } = req.body;

  // check if resetPasswordToken is valid
  const existingUser = await User.findOne({ forgotPasswordToken: resetPasswordToken });
  if (!existingUser) throw new APIError(400, "Reset Password Error", "Invalid token");

  // check if resetPasswordToken is expired
  const isTokenExpired = existingUser.forgotPasswordExpiry < Date.now();
  if (isTokenExpired)
    throw new APIError(410, "Reset Password Error", "Token expired, please request a new one");

  // check if password is same as old password
  const isSamePassword = await existingUser.isPasswordCorrect(newPassword);
  if (isSamePassword)
    throw new APIError(400, "Reset Password Error", "New password cannot be same as old password");

  // update password
  existingUser.password = newPassword;

  // remove the token and its expiry
  existingUser.forgotPasswordToken = undefined;
  existingUser.forgotPasswordExpiry = undefined;

  // update user in db
  await existingUser.save();

  // send password change confirmation to user in email
  await sendMail({
    email: existingUser.email,
    subject: "Password Change Confirmation - CodeLab",
    mailGenContent: passwordChangeConfirmationMailContentGenerator(existingUser.username),
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Password reset successfully"));
});

// @controller PATCH /refresh-access-token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token from cookies
  const { refreshToken } = req.cookies;

  // check if refresh token is present
  if (!refreshToken) throw new APIError(401, "Authentication Error", "Unauthorized");

  // decode refresh token
  const decodedToken = jwt.verify(refreshToken, envConfig.REFRESH_TOKEN_SECRET);

  // check if user exists and refresh token matches
  const existingUser = await User.findById(decodedToken.id);
  if (!existingUser || existingUser.refreshToken !== refreshToken)
    throw new APIError(403, "Authentication Error", "Invalid Refresh Token");

  // generate new accessToken and accessToken
  const newAccessToken = existingUser.generateAccessToken();
  const newRefreshToken = existingUser.generateRefreshToken();

  // store refresh token in db
  existingUser.refreshToken = newRefreshToken;

  // update user in db
  await existingUser.save({ validateBeforeSave: false });

  // success status to user, save accessToken and refreshToken into cookies
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "None",
      maxAge: ms(envConfig.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "None",
      maxAge: ms(envConfig.REFRESH_TOKEN_EXPIRY),
    })
    .json(
      new APIResponse(200, "Access Token refreshed successfully", {
        newAccessToken,
        newRefreshToken,
      }),
    );
});

// @controller POST /resend-verification-email
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  // get user with req.user.id
  const existingUser = await User.findById(req.user.id);

  // check if user is already verified
  if (existingUser.isEmailVerified)
    throw new APIError(409, "Verification Error", "User already verified");

  // generate new emailVerificationToken and expiry
  const { token, tokenExpiry } = existingUser.generateTemporaryToken();

  // store in db
  existingUser.emailVerificationToken = token;
  existingUser.emailVerificationExpiry = tokenExpiry;

  // update user in db
  await existingUser.save();

  // send emailVerificationToken to user by email
  await sendMail({
    email: existingUser.email,
    subject: "Verify your account - CodeLab",
    mailGenContent: verificationMailContentGenerator(existingUser.username, token),
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Verification email sent successfully"));
});

// @controller GET /profile
export const getLoggedInUserProfile = asyncHandler(async (req, res) => {
  // get user from db by it's id
  const existingUser = await User.findById(req.user.id)
    .select(
      "_id username email fullname avatar role isEmailVerified solvedProblems sheets createdAt",
    )
    .populate("solvedProblems", "_id title difficulty tags slug")
    .populate("sheets", "_id title status createdAt");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "User details fetched successfully", existingUser));
});

// @controller PATCH /update-avatar
export const updateUserAvatar = asyncHandler(async (req, res) => {
  // get avatar file local path
  const avatarLocalPath = req.file.path;
  if (!avatarLocalPath)
    throw new APIError(
      400,
      "Update Avatar Error",
      "Something went wrong while uploading avatar on local disk",
    );

  // upload avatar to cloud storage
  const avatarCloudImg = await uploadImageonCloudinary(avatarLocalPath);
  if (!avatarCloudImg)
    throw new APIError(
      500,
      "Update Avatar Error",
      "Something went wrong while uploading avatar to cloud",
    );

  // get user from db by its id
  const updateUser = await User.findById(req.user.id).select("avatar");

  // update avatar cloud url, publicId, mimeType and size
  updateUser.avatar.url = avatarCloudImg.secure_url;
  updateUser.avatar.publicId = avatarCloudImg.public_id;
  updateUser.avatar.mimeType = avatarCloudImg.resource_type + "/" + avatarCloudImg.format;
  updateUser.avatar.size = avatarCloudImg.bytes;

  // update user in db
  await updateUser.save();

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "User avatar updated successfully", updateUser.avatar));
});

// @controller PATCH /update-profile
export const updateUserDetails = asyncHandler(async (req, res) => {
  // get data from body
  const { username, fullname } = req.body;

  // check if user exists with same username
  const existingUser = await User.findOne({
    username,
    _id: { $ne: req.user.id },
  });
  if (existingUser)
    throw new APIError(
      409,
      "Update Profile Error",
      "Another user already exists with this username",
    );

  // get user from db by its id
  const updateUser = await User.findById(req.user.id).select("username fullname");

  // check if user has provided same username and fullname
  if (updateUser.username === username && updateUser.fullname === fullname)
    throw new APIError(
      400,
      "Update Profile Error",
      "New username and fullname can't be same as old username and fullname",
    );

  // update username conditionally
  if (updateUser.username !== username) updateUser.username = username;

  // update fullname conditionally
  if (updateUser.fullname !== fullname) updateUser.fullname = fullname;

  // update user in db
  await updateUser.save();

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "User details updated successfully", updateUser));
});

// @controller PATCH /update-password
export const updateUserCurrentPassword = asyncHandler(async (req, res) => {
  // get currentPassword and newPassword
  const { currentPassword, newPassword } = req.body;

  // get user from db by its id
  const existingUser = await User.findById(req.user.id);

  // check if old password is correct
  const isOldPasswordCorrect = await existingUser.isPasswordCorrect(currentPassword);
  if (!isOldPasswordCorrect)
    throw new APIError(400, "Change Password Error", "Old password is incorrect");

  // check if new password is same as old password
  const isSamePassword = await existingUser.isPasswordCorrect(newPassword);
  if (isSamePassword)
    throw new APIError(400, "Change Password Error", "New password cannot be same as old password");

  // update password
  existingUser.password = newPassword;

  // update user in db
  await existingUser.save();

  // send password change confirmation to user in email
  // await sendMail({
  //   email: existingUser.email,
  //   subject: "Password Change Confirmation - CodeLab",
  //   mailGenContent: passwordChangeConfirmationMailContentGenerator(existingUser.username),
  // });

  // success status to user
  return res.status(200).json(new APIResponse(200, "Password updated successfully"));
});

// @controller DELETE /delete-account
export const deleteUser = asyncHandler(async (req, res) => {
  // get user from db by its id
  const existingUser = await User.findById(req.user.id);

  // delete user avatar from cloud storage if exists
  if (existingUser.avatar.size) {
    // delete avatar from cloud storage
    const isAvatarDeleted = await deleteImageFromCloudinary(existingUser.avatar.publicId);
    if (!isAvatarDeleted)
      throw new APIError(500, "Delete Account Error", "Something went wrong while deleting avatar");
  }

  // delete user from db
  await existingUser.deleteOne();

  // send account deletion confirmation to user in email
  await sendMail({
    email: existingUser.email,
    subject: "Account Deletion Confirmation - CodeLab",
    mailGenContent: accountDeletionConfirmationMailContentGenerator(existingUser.username),
  });

  // success status to user
  return res.status(200).json(new APIResponse(200, "User account deleted successfully"));
});

// @controller POST /logout
export const logoutUser = asyncHandler(async (req, res) => {
  // get user from db
  const existingUser = await User.findById(req.user.id);

  // remove refresh token from db
  existingUser.refreshToken = undefined;

  // update user in db
  await existingUser.save();

  // success status to user, clear cookies
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new APIResponse(200, "Logout Successful"));
});
