// import package modules
import mongoose, { Schema } from "mongoose";

// import local modules
import { AvailableJudge0ErrorIdMessages, AvailableJudge0Languages } from "../../utils/constants.js";

// schema for testCaseResult
const testCaseResultSchema = new Schema(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    testCase: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    stdin: {
      type: String,
      default: "",
    },
    stdout: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    compileOutput: {
      type: String,
      default: "",
    },
    memory: {
      type: Number,
      default: 0,
    },
    time: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: AvailableJudge0ErrorIdMessages,
      required: true,
    },
  },
  { timestamps: true },
);

// schema for submission
const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: AvailableJudge0Languages,
      required: true,
    },
    stdin: {
      type: String,
      default: "",
    },
    stdout: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    compileOutput: {
      type: String,
      default: "",
    },
    memory: {
      type: Number,
      default: 0,
    },
    time: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: AvailableJudge0ErrorIdMessages,
      required: true,
    },
    testCases: {
      type: [testCaseResultSchema],
      required: true,
    },
  },
  { timestamps: true },
);

// export submission model
export const Submission = mongoose.model("Submission", submissionSchema);
