// import package modules
import mongoose, { Schema } from "mongoose";

// import local modules
import { AvailableJudge0Languages, AvailableProblemDifficulties } from "../../utils/constants.js";

// schema for code snippet
const codeSnippetSchema = new Schema({
  language: { type: String, enum: AvailableJudge0Languages, required: true },
  code: { type: String, trim: true, required: true },
});

// schema for editorial
const editorialSchema = new Schema({
  problemBreakdown: { type: String, trim: true, required: true },
  solutionApproachDiscussion: { type: String, trim: true, required: true },
  timeAndSpaceComplexityDiscussion: { type: String, trim: true, required: true },
  edgeCasesDiscussion: { type: String, trim: true, required: true },
  solutionCode: { type: [codeSnippetSchema], required: true },
});

// schema for examples
const exampleSchema = new Schema({
  input: { type: String, trim: true, required: true },
  output: { type: String, trim: true, required: true },
  explanation: { type: String, trim: true, required: true },
});

// schema for test cases
const testCaseSchema = new Schema({
  input: { type: String, trim: true, required: true },
  output: { type: String, trim: true, required: true },
});

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
    codeSnippets: {
      type: [codeSnippetSchema],
      required: true,
    },
    codeSolutions: {
      type: [codeSnippetSchema],
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// export problem model
export const Problem = mongoose.model("Problem", problemSchema);
