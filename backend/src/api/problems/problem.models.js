// import package modules
import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

// import local modules
import { AvailableProblemDifficulties } from "../../utils/constants.js";

// schema for code snippet
const codeSnippetSchema = new Schema({
  language: { type: String, trim: true, default: "" },
  code: { type: String, trim: true, default: "" },
});

// schema for editorial
const editorialSchema = new Schema({
  problemBreakdown: { type: String, trim: true, default: "" },
  solutionApproachDiscussion: { type: String, trim: true, default: "" },
  timeAndSpaceComplexityDiscussion: { type: String, trim: true, default: "" },
  edgeCasesDiscussion: { type: String, trim: true, default: "" },
  solutionCode: { type: [codeSnippetSchema], default: [] },
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
      default: [],
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
      default: {},
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
      required: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

// trim all string fields in array before saving
problemSchema.pre("save", function (next) {
  // generate slug from title
  this.slug = slugify(this.title, { lower: true, strict: true });

  // trim all tags
  if (this.tags) this.tags = this.tags.map(tag => tag.trim());

  // trim all constraints
  if (this.constraints) this.constraints = this.constraints.map(constraint => constraint.trim());

  // trim all hints
  if (this.hints) this.hints = this.hints.map(hint => hint.trim());

  next();
});

// export problem model
export const Problem = mongoose.model("Problem", problemSchema);
