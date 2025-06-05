// import package modules
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// import local modules
import { envConfig } from "../../../../utils/env.js";
import { AvailableUserRoles, UserRolesEnum } from "../../../../utils/constants.js";

// schema for user
const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: {
          type: String,
          trim: true,
          required: true,
        },
        publicId: {
          type: String,
          trim: true,
          required: true,
        },
        mimeType: {
          type: String,
          enum: ["image/png", "image/jpeg", "image/jpg"],
          default: "image/png",
        },
        size: {
          type: Number,
          required: true,
        },
      },
      default: {
        url: "https://placehold.co/600x400",
        publicId: "default-avatar",
        size: 0,
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    solvedProblems: {
      type: [Schema.Types.ObjectId],
      ref: "Problem",
      default: [],
    },
  },
  { timestamps: true },
);

// pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 10);
  next();
});

// method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// method to generateAccessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, envConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: envConfig.ACCESS_TOKEN_EXPIRY,
  });
};

// method to generateRefreshToken
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, envConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: envConfig.REFRESH_TOKEN_EXPIRY,
  });
};

// method to generateTemporaryToken, can be used for email verification and password reset
userSchema.methods.generateTemporaryToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = Date.now() + 5 * 60 * 1000;

  return { token, tokenExpiry };
};

// export user model
export const User = mongoose.model("User", userSchema);
