// import local modules
import { asyncHandler } from "../../../utils/async-handler.js";
import { User } from "./user.models.js";
import { APIError } from "../../error.api.js";
import { APIResponse } from "../../response.api.js";
import { sendMail } from "../../../utils/mail/send.mail.js";
import { verificationMailContentGenerator } from "../../../utils/mail/genContent.mail.js";

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

// @controller PATCH /verify-account:token
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
