// import package modules
import mongoose, { Schema } from "mongoose";

// import local modules
import {
  AvailableJudge0ErrorIdMessages,
  AvailableJudge0Languages,
  AvailableSubmissionStatuses,
} from "../../../utils/constants.js";

// schema for testCaseResult
const testCaseResultSchema = new Schema(
  {
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
    },
    stdout: {
      type: String,
    },
    expectedOutput: {
      type: String,
    },
    stderr: {
      type: String,
    },
    compileOutput: {
      type: String,
    },
    memory: {
      type: String,
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      enum: AvailableJudge0ErrorIdMessages,
      required: true,
    },
  },
  { timestamps: true, _id: false },
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
    status: {
      type: String,
      enum: AvailableSubmissionStatuses,
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
