// import local modules
import { asyncHandler } from "../../utils/async-handler.js";
import { User } from "./user.models.js";
import { APIError } from "../error.api.js";
import { APIResponse } from "../response.api.js";
import { sendMail } from "../../utils/mail/send.mail.js";
import { verificationMailContentGenerator } from "../../utils/mail/genContent.mail.js";

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
