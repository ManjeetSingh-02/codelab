// import package modules
import ms from "ms";
import jwt from "jsonwebtoken";

// import local modules
import { asyncHandler } from "../../../utils/async-handler.js";
import { User } from "./user.models.js";
import { APIError } from "../../error.api.js";
import { APIResponse } from "../../response.api.js";
import { sendMail } from "../../../utils/mail/send.mail.js";
import {
  forgotPasswordMailContentGenerator,
  passwordResetConfirmationMailContentGenerator,
  verificationMailContentGenerator,
} from "../../../utils/mail/genContent.mail.js";

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
  });
  if (!newUser)
    throw new APIError(500, "User Registration Error", [
      "Something went wrong while registering user",
    ]);

  // generate email verification token and expiry and store in db
  const { token, tokenExpiry } = newUser.generateTemporaryToken();
  newUser.emailVerificationToken = token;
  newUser.emailVerificationExpiry = tokenExpiry;

  // update user in db
  await newUser.save();

  // send emailVerificationToken to user by email
  await sendMail({
    email: newUser.email,
    subject: "Verify your account - CodeLab",
    mailGenContent: verificationMailContentGenerator(newUser.username, token),
  });

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

  // check if user is verified
  if (!existingUser.isEmailVerified) throw new APIError(403, "Login Error", "Email not verified");

  // generate access & refresh token
  const accessToken = existingUser.generateAccessToken();
  const refreshToken = existingUser.generateRefreshToken();

  // store refresh token in db
  existingUser.refreshToken = refreshToken;

  // update user in db
  await existingUser.save({ validateBeforeSave: false });

  // success status to user, save accessToken and refreshToken into cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
    })
    .json(new APIResponse(200, "Login Successful"));
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

  // send password reset confirmation to user in email
  await sendMail({
    email: existingUser.email,
    subject: "Password Reset Confirmation - CodeLab",
    mailGenContent: passwordResetConfirmationMailContentGenerator(existingUser.username),
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
  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

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

  console.log(refreshToken);

  // success status to user, save accessToken and refreshToken into cookies
  return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.ACCESS_TOKEN_EXPIRY),
    })
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRY),
    })
    .json(
      new APIResponse(200, "Access Token refreshed successfully", {
        newAccessToken,
        newRefreshToken,
      }),
    );
});
