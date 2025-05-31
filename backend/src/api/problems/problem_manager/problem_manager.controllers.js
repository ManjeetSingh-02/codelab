// import package modules
import slugify from "slugify";

// import local modules
import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../error.api.js";
import { APIResponse } from "../../response.api.js";
import { Problem } from "../problem.models.js";
import { Judge0LanguagesIdMap, Judge0ErrorIdMap } from "../../../utils/constants.js";
import { submitBatchAndGetTokens, poolBatchTokensAndGetResults } from "../../../utils/judge0.js";

// @controller POST /
export const createProblem = asyncHandler(async (req, res) => {
  // get data from body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    hints,
    editorial,
    testCases,
    codeInformations,
  } = req.body;

  // check if problem already exists with the same title
  const existingProblem = await Problem.findOne({ title });
  if (existingProblem)
    throw new APIError(400, "Create Problem Error", "Problem with this title already exists");

  // validate all code solutions with test cases
  for (const codeInfo of codeInformations) {
    try {
      // get language id from Judge0LanguagesIdMap
      const { id } = Judge0LanguagesIdMap[codeInfo.language];

      // prepare submissions object by each testcase input, output, language and solution
      const allSubmissions = testCases.map(testCase => ({
        source_code: codeInfo.solution,
        language_id: id,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      // get all submissions tokens from judge0 API
      const submissionResult = await submitBatchAndGetTokens(allSubmissions);

      // check if submissionResult is an error
      if (submissionResult instanceof Error)
        throw new APIError(
          500,
          "Create Problem Error",
          "Failed to submit code solutions, please try again",
        );

      // prepare submission tokens from the submissionResult
      const submissionTokens = submissionResult.map(submission => submission.token);

      // check if all submissions are correct
      const finalResults = await poolBatchTokensAndGetResults(submissionTokens);

      // check if finalResults is an error
      if (finalResults instanceof Error)
        throw new APIError(
          500,
          "Create Problem Error",
          "Failed to get code solutions submission results, please try again",
        );

      // check if all results are correct
      for (let i = 0; i < finalResults.submissions.length; i++) {
        if (finalResults.submissions[i].status.id !== 3) {
          throw new APIError(
            Judge0ErrorIdMap[finalResults.submissions[i].status.id].statusCode,
            "Create Problem Error",
            `Test Case ${i + 1} failed for ${codeInfo.language.toUpperCase()} language due to ${Judge0ErrorIdMap[finalResults.submissions[i].status.id].statusMessage}`,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // create new problem in db
  const newProblem = await Problem.create({
    title,
    description,
    difficulty,
    tags,
    createdBy: req.user.id,
    examples,
    constraints,
    hints,
    editorial,
    testCases,
    codeInformations,
    slug: slugify(title, { lower: true, strict: true }),
  });
  if (!newProblem)
    throw new APIError(500, "Create Problem Error", "Something went wrong while creating problem");

  // success status to user
  res
    .status(201)
    .json(new APIResponse(201, "Create Problem Success", "Problem created successfully"));
});
