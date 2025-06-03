// import local modules
import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../error.api.js";
import { APIResponse } from "../../response.api.js";
import { Problem } from "../problem.models.js";
import { User } from "../../auth/user/user.models.js";

// @controller GET /
export const getAllProblems = asyncHandler(async (req, res) => {
  // get all problems from db
  const allProblems = await Problem.find({}).select("title difficulty tags slug");

  // check if user is viewing problems anonymously or logged in to show solved status
  if (req.user?.id) {
    // check if user already solved any problems
    allProblems.forEach(async problem => {
      const isProblemSolved = await User.findOne({ solvedProblems: problem._id });
      if (isProblemSolved) problem.isSolvedByUser = true;
    });
  }

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "All problems fetched successfully", allProblems));
});

// @controller GET /:problemSlug
export const getOneProblem = asyncHandler(async (req, res) => {
  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug })
    .select("-slug -__v -createdAt")
    .populate("createdBy", "_id username");
  if (!existingProblem) throw new APIError(404, "Problem not found");

  // check if user is viewing problem anonymously or logged in to show solved status
  if (req.user?.id) {
    // check if user already solved the problem
    const isProblemSolved = await User.findOne({ solvedProblems: existingProblem._id });
    if (isProblemSolved) existingProblem.isSolvedByUser = true;
  }

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Problem fetched successfully", existingProblem));
});

// @controller POST /:problemSlug/run-code
export const runCode = asyncHandler(async (req, res) => {
  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem) throw new APIError(404, "Run Code Error", "Problem not found");

  // get test cases execution result and execution status from the request
  const { testCasesExecutionResults, executionStatus } = req.problemExecutionResults;

  // success status to user
  return res.status(200).json(
    new APIResponse(200, "Code Executed Successfully", {
      testCasesExecutionResults,
      executionStatus,
    }),
  );
});

// @controller POST /:problemSlug/submit-code
export const submitCode = asyncHandler(async (req, res) => {});
