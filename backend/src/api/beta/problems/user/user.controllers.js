// import local modules
import { asyncHandler } from "../../../../utils/async-handler.js";
import { APIError } from "../../../error.api.js";
import { APIResponse } from "../../../response.api.js";
import { Problem } from "../problem.models.js";
import { User } from "../../auth/user/user.models.js";
import { Submission } from "../../submissions/submission.models.js";
import { SubmissionStatusEnum } from "../../../../utils/constants.js";

// @controller GET /
export const getAllProblems = asyncHandler(async (_, res) => {
  // get all problems from db
  const allProblems = await Problem.find({}).select("title difficulty tags slug solvedBy");

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
  if (!existingProblem) throw new APIError(404, "Get Problem Error", "Problem not found");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "Problem fetched successfully", existingProblem));
});

// @controller GET /user/solved
export const getAllSolvedProblems = asyncHandler(async (req, res) => {
  // get all problems solved by user
  const allSolvedProblems = await User.findById(req.user.id)
    .select("solvedProblems -_id")
    .populate("solvedProblems", "title difficulty tags slug");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "All solved problems fetched successfully", allSolvedProblems));
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
export const submitCode = asyncHandler(async (req, res) => {
  // get data from body
  const { source_code, language } = req.body;

  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem) throw new APIError(404, "Submit Code Error", "Problem not found");

  // get test cases execution result and execution status from the request
  const { testCasesExecutionResults, executionStatus } = req.problemExecutionResults;

  // create a new submission
  const newSubmission = await Submission.create({
    problemId: existingProblem._id,
    userId: req.user.id,
    sourceCode: source_code,
    language,
    status: executionStatus,
    testCases: testCasesExecutionResults,
  });
  if (!newSubmission)
    throw new APIError(500, "Submit Code Error", "Something went wrong while submitting code");

  // if problem is solved successfully by user first time, update user's solvedProblems and problem's solvedBy fields
  if (
    executionStatus === SubmissionStatusEnum.ACCEPTED &&
    !existingProblem.solvedBy.includes(req.user.id)
  ) {
    // get user by id
    const existingUser = await User.findById(req.user.id);

    // update user's solvedProblems
    existingUser.solvedProblems.push(existingProblem._id);
    await existingUser.save();

    // update problem's solvedBy
    existingProblem.solvedBy.push(existingUser._id);
    await existingProblem.save();
  }

  // success status to user
  return res.status(201).json(new APIResponse(201, "Code Submitted Successfully", newSubmission));
});
