// import package modules
import { z } from "zod";

// import local modules
import {
  AvailableJudge0Languages,
  AvailableProblemDifficulties,
} from "../../../utils/constants.js";

// zod schema for problem title
const problemTitleSchema = z
  .string()
  .trim()
  .nonempty({ message: "Problem Title is required" })
  .min(5, { message: "Problem Title must be at least 5 characters long" })
  .max(50, { message: "Problem Title must be at most 50 characters long" });

// zod schema for problem description
const problemDescriptionSchema = z
  .string()
  .trim()
  .nonempty({ message: "Problem Description is required" })
  .min(30, { message: "Problem Description must be at least 30 characters long" })
  .max(300, { message: "Problem Description must be at most 300 characters long" });

// zod schema for problem examples
const problemExampleSchema = z.object({
  input: z.string().trim().optional(),
  output: z.string().trim().nonempty({ message: "Example Output is required" }),
  explanation: z.string().trim().nonempty({ message: "Example Explanation is required" }),
});

// zod schema for editorial
const problemEditorialSchema = z.object({
  problemBreakdown: z
    .array(z.string().trim())
    .min(1, { message: "EDITORIAL: Problem Breakdown is required" }),
  solutionApproachDiscussion: z
    .array(z.string().trim())
    .min(1, { message: "EDITORIAL: Solution Approach Discussion is required" }),
  timeComplexityDiscussion: z.object({
    bestCase: z
      .string()
      .trim()
      .nonempty({ message: "EDITORIAL: Best Case Time Complexity is required" }),
    averageCase: z
      .string()
      .trim()
      .nonempty({ message: "EDITORIAL: Average Case Time Complexity is required" }),
    worstCase: z
      .string()
      .trim()
      .nonempty({ message: "EDITORIAL: Worst Case Time Complexity is required" }),
  }),
  spaceComplexityDiscussion: z.object({
    bestCase: z
      .string()
      .trim()
      .nonempty({ message: "EDITORIAL: Best Case Space Complexity is required" }),
    averageCase: z
      .string()
      .trim()
      .nonempty({ message: "EDITORIAL: Average Case Space Complexity is required" }),
    worstCase: z
      .string()
      .trim()
      .nonempty({ message: "EDITORIAL: Worst Case Space Complexity is required" }),
  }),
  edgeCasesDiscussion: z
    .array(
      z.object({
        case: z.string().trim().optional(),
        discussion: z.string().trim().optional(),
      }),
    )
    .default([]),
  solutionCode: z.array(
    z.object({
      language: z.enum(AvailableJudge0Languages, {
        message: "EDITORIAL: Invalid programming language",
      }),
      code: z.string().trim().nonempty({ message: "EDITORIAL: Solution Code is required" }),
    }),
  ),
});

// zod schema for test cases
const testCaseSchema = z.object({
  input: z.string().trim().optional(),
  output: z.string().trim().nonempty({ message: "Test Case Output is required" }),
  isLocked: z.boolean({ required_error: "Test Case Status is required" }),
});

// zod schema for code information
const codeInformationSchema = z.object({
  language: z.enum(AvailableJudge0Languages, { message: "Invalid programming language" }),
  snippet: z.string().trim().nonempty({ message: "Code Snippet is required" }),
  solution: z.string().trim().nonempty({ message: "Code Solution is required" }),
});

// zod schema for createProblem
export const createProblemSchema = z.object({
  title: problemTitleSchema,
  description: problemDescriptionSchema,
  difficulty: z.enum(AvailableProblemDifficulties, {
    message: "Invalid problem difficulty",
  }),
  tags: z.array(z.string().trim()).refine(tags => new Set(tags).size === tags.length, {
    message: "Tags must be unique",
  }),
  examples: z.array(problemExampleSchema).min(1, {
    message: "At least one example is required",
  }),
  constraints: z
    .array(z.string().trim())
    .min(1, { message: "At least one constraint is required" }),
  hints: z.array(z.string().trim()).default([]),
  editorial: problemEditorialSchema,
  testCases: z.array(testCaseSchema).min(1, {
    message: "At least one test case is required",
  }),
  codeInformations: z.array(codeInformationSchema).min(1, {
    message: "At least one code information is required",
  }),
});

// zod schema for updateProblemInformation
export const updateProblemInformationSchema = z.object({
  description: problemDescriptionSchema,
  difficulty: z.enum(AvailableProblemDifficulties, {
    message: "Invalid problem difficulty",
  }),
  tags: z.array(z.string().trim()).refine(tags => new Set(tags).size === tags.length, {
    message: "Tags must be unique",
  }),
  examples: z.array(problemExampleSchema).min(1, {
    message: "At least one example is required",
  }),
  constraints: z
    .array(z.string().trim())
    .min(1, { message: "At least one constraint is required" }),
  hints: z.array(z.string().trim()).default([]),
});

// zod schema for updateProblemEditorial
export const updateProblemEditorialSchema = z.object({
  editorial: problemEditorialSchema,
});

// zod schema for updateProblemTestCasesAndCodeInformations
export const updateProblemTestCasesAndCodeInformationsSchema = z.object({
  testCases: z.array(testCaseSchema).min(1, {
    message: "At least one test case is required",
  }),
  codeInformations: z.array(codeInformationSchema).min(1, {
    message: "At least one code information is required",
  }),
});
