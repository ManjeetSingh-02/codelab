// import package modules
import mongoose, { Schema } from "mongoose";

// import local modules
import {
  AvailableJudge0Languages,
  AvailableProblemDifficulties,
} from "../../../utils/constants.js";

// schema for examples
const exampleSchema = new Schema(
  {
    input: { type: String, trim: true, default: "" },
    output: { type: String, trim: true, required: true },
    explanation: { type: String, trim: true, required: true },
  },
  { _id: false },
);

// schema for editorial
const editorialSchema = new Schema(
  {
    problemBreakdown: { type: [String], required: true },
    solutionApproachDiscussion: { type: [String], required: true },
    timeComplexityDiscussion: {
      bestCase: { type: String, required: true },
      averageCase: { type: String, required: true },
      worstCase: { type: String, required: true },
    },
    spaceComplexityDiscussion: {
      bestCase: { type: String, required: true },
      averageCase: { type: String, required: true },
      worstCase: { type: String, required: true },
    },
    edgeCasesDiscussion: {
      type: [
        {
          case: { type: String, default: "" },
          discussion: { type: String, default: "" },
        },
      ],
      default: [],
    },
    solutionCode: {
      type: [
        {
          language: { type: String, enum: AvailableJudge0Languages, required: true },
          code: { type: String, trim: true, required: true },
        },
      ],
    },
  },
  { _id: false },
);

// schema for test cases
const testCaseSchema = new Schema(
  {
    input: { type: String, trim: true, default: "" },
    output: { type: String, trim: true, required: true },
    isLocked: { type: Boolean, required: true },
  },
  { _id: false },
);

// schema for code information
const codeInformationSchema = new Schema(
  {
    language: { type: String, enum: AvailableJudge0Languages, required: true },
    snippet: { type: String, trim: true, required: true },
    solution: { type: String, trim: true, required: true },
  },
  { _id: false },
);

// schema for problem
const problemSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    difficulty: {
      type: String,
      enum: AvailableProblemDifficulties,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examples: {
      type: [exampleSchema],
      required: true,
    },
    constraints: {
      type: [String],
      required: true,
    },
    hints: {
      type: [String],
      default: [],
    },
    editorial: {
      type: editorialSchema,
      required: true,
    },
    testCases: {
      type: [testCaseSchema],
      required: true,
    },
    codeInformations: {
      type: [codeInformationSchema],
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
    solvedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true },
);

// export problem model
export const Problem = mongoose.model("Problem", problemSchema);
