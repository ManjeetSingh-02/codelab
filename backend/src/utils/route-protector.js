// import package modules
import jwt from "jsonwebtoken";

// import local modules
import { envConfig } from "./env.js";
import { APIError } from "../api/error.api.js";
import { asyncHandler } from "./async-handler.js";
import { User } from "../api/beta/auth/user/user.models.js";
import { Problem } from "../api/beta/problems/problem.models.js";
import { Judge0LanguagesIdMap, Judge0ErrorIdMap, SubmissionStatusEnum } from "./constants.js";
import { pollBatchTokensAndGetResults, submitBatchAndGetTokens } from "./judge0.js";

// function to check for any validation errors
export const isLoggedIn = asyncHandler(async (req, _, next) => {
  // get access token
  const accessToken = req.cookies.accessToken;
  if (!accessToken) throw new APIError(401, "Security Error", "Unauthorized");

  // decode access token
  const decodedToken = jwt.verify(accessToken, envConfig.ACCESS_TOKEN_SECRET);

  // check if user exists
  const loggedInUser = await User.findById(decodedToken?.id);
  if (!loggedInUser) throw new APIError(401, "Security Error", "Invalid Access Token");

  // set user in request object
  req.user = {
    id: loggedInUser._id,
    email: loggedInUser.email,
  };

  // forward request to next middleware
  next();
});

// function to check if user is verified
export const isVerified = asyncHandler(async (req, _, next) => {
  // get user from db by it's id
  const existingUser = await User.findById(req.user.id);

  // check if user is verified
  if (!existingUser.isEmailVerified)
    throw new APIError(403, "Security Error", "Email verification required");

  // forward request to next middleware
  next();
});

// function to check for any validation errors
export const validateSchema = zodSchema =>
  asyncHandler(async (req, _, next) => {
    // get validation result by parsing the request-body with the given zod-schema
    const validationResult = zodSchema.safeParse(req.body);

    // if validation fails, throw an error
    if (!validationResult.success)
      throw new APIError(
        400,
        "Validation Error",
        validationResult.error.issues.map(
          issue => `${issue.path.join(", ") || "All fields"} ${issue.message}`,
        ),
      );

    // forward request to next middleware
    next();
  });

// function for checking if user has required role
export const hasRequiredRole = roles =>
  asyncHandler(async (req, _, next) => {
    // get user from db by it's id
    const existingMember = await User.findById(req.user.id).select("role");

    // check if user doesn't have any one of the required roles
    if (!roles.includes(existingMember.role))
      throw new APIError(403, "Security Error", "Access Denied for not having required role");

    // set user role in request object
    req.user.role = existingMember.role;

    // forward request to next middleware
    next();
  });

// function to execute code for a problem
export const executeCode = asyncHandler(async (req, _, next) => {
  // get data from body
  const { source_code, language, stdin, expected_outputs } = req.body;

  // check if stdin and output have same length
  if (stdin.length !== expected_outputs.length)
    throw new APIError(400, "Execute Code Error", "Number of inputs and outputs must match");

  // check if problem exists
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem) throw new APIError(404, "Execute Code Error", "Problem not found");

  // get language id from Judge0LanguagesIdMap
  const { id } = Judge0LanguagesIdMap[language];

  // prepare submission object
  const allSubmissions = stdin.map(input => ({
    source_code,
    language_id: id,
    stdin: input,
  }));

  // get all submissions tokens from judge0 API
  const submissionResult = await submitBatchAndGetTokens(allSubmissions);

  // check if submissionResult is an error
  if (submissionResult instanceof Error)
    throw new APIError(
      500,
      "Execute Code Error",
      "Failed to submit code solutions, please try again",
    );

  // prepare submission tokens from the submissionResult
  const submissionTokens = submissionResult.map(submission => submission.token);

  // poll batch tokens and get results
  const finalResults = await pollBatchTokensAndGetResults(submissionTokens);

  // check if finalResults is an error
  if (finalResults instanceof Error)
    throw new APIError(
      500,
      "Execute Code Error",
      "Failed to get code solutions submission results, please try again",
    );

  let allPassed = true;

  // get test cases execution results
  const testCasesExecutionResults = finalResults.submissions.map((submission, index) => {
    const stdout = submission.stdout?.trim();
    const expectedOutput = expected_outputs[index]?.trim();
    const isCorrect = stdout === expectedOutput;

    // if any output is incorrect, set allPassed to false
    if (!isCorrect) allPassed = false;

    return {
      testCase: index + 1,
      passed: isCorrect,
      stdin: submission.stdin?.trim() || null,
      stdout: stdout || null,
      expectedOutput: expectedOutput || null,
      stderr: submission.stderr?.trim() || null,
      compileOutput: submission.compile_output?.trim() || null,
      memory: submission.memory ? `${submission.memory} KB` : null,
      time: submission.time ? `${submission.time} s` : null,
      status: Judge0ErrorIdMap[submission.status.id]?.statusMessage || "Unknown",
    };
  });

  // set problem execution results in request object
  req.problemExecutionResults = {
    testCasesExecutionResults,
    executionStatus: allPassed ? SubmissionStatusEnum.ACCEPTED : SubmissionStatusEnum.WRONG_ANSWER,
  };

  // forward request to next middleware
  next();
});
