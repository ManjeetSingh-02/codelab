// import package modules
import slugify from "slugify";

// import local modules
import { asyncHandler } from "../../../../utils/async-handler.js";
import { APIError } from "../../../error.api.js";
import { APIResponse } from "../../../response.api.js";
import { Problem } from "../problem.models.js";
import { Judge0LanguagesIdMap, Judge0ErrorIdMap, UserRolesEnum } from "../../../../utils/constants.js";
import { submitBatchAndGetTokens, pollBatchTokensAndGetResults } from "../../../../utils/judge0.js";
import { Submission } from "../../submissions/submission.models.js";
import { Sheet } from "../../sheets/sheet.models.js";

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
      const finalResults = await pollBatchTokensAndGetResults(submissionTokens);

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
  res.status(201).json(new APIResponse(201, "Problem created successfully"));
});

// @controller PATCH /:problemSlug/update-information
export const updateProblemInformation = asyncHandler(async (req, res) => {
  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem)
    throw new APIError(404, "Update Problem Information Error", "Problem doesn't exist");

  // check if user in not admin and trying to update information of other's problem
  if (req.user.role !== UserRolesEnum.ADMIN && req.user.id !== existingProblem.createdBy.toString())
    throw new APIError(
      403,
      "Update Problem Information Error",
      "Access Denied for not having required permissions",
    );

  // get data from body
  const { description, difficulty, tags, examples, constraints, hints } = req.body;

  // update problem information
  existingProblem.description = description;
  existingProblem.difficulty = difficulty;
  existingProblem.tags = tags;
  existingProblem.examples = examples;
  existingProblem.constraints = constraints;
  existingProblem.hints = hints;

  // save updated problem
  await existingProblem.save();

  // success status to user
  res.status(200).json(new APIResponse(200, "Problem Information Updated Successfully"));
});

// @controller PATCH /:problemSlug/update-editorial
export const updateProblemEditorial = asyncHandler(async (req, res) => {
  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem)
    throw new APIError(404, "Update Problem Editorial Error", "Problem doesn't exist");

  // check if user in not admin and trying to update editorial of other's problem
  if (req.user.role !== UserRolesEnum.ADMIN && req.user.id !== existingProblem.createdBy.toString())
    throw new APIError(
      403,
      "Update Problem Editorial Error",
      "Access Denied for not having required permissions",
    );

  // get data from body
  const { editorial } = req.body;

  // update editorial
  existingProblem.editorial = editorial;

  // save updated problem
  await existingProblem.save();

  // success status to user
  res.status(200).json(new APIResponse(200, "Problem Editorial Updated Successfully"));
});

// @controller PATCH /:problemSlug/update-testcases-codeinformations
export const updateProblemTestCasesAndCodeInformations = asyncHandler(async (req, res) => {
  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem)
    throw new APIError(
      404,
      "Update Problem Test Cases and Code Informations Error",
      "Problem doesn't exist",
    );

  // check if user in not admin and trying to update test cases and code informations of other's problem
  if (req.user.role !== UserRolesEnum.ADMIN && req.user.id !== existingProblem.createdBy.toString())
    throw new APIError(
      403,
      "Update Problem Test Cases and Code Informations Error",
      "Access Denied for not having required permissions",
    );

  // get data from body
  const { testCases, codeInformations } = req.body;

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
          "Update Problem Test Cases and Code Informations Error",
          "Failed to submit code solutions, please try again",
        );

      // prepare submission tokens from the submissionResult
      const submissionTokens = submissionResult.map(submission => submission.token);

      // check if all submissions are correct
      const finalResults = await pollBatchTokensAndGetResults(submissionTokens);

      // check if finalResults is an error
      if (finalResults instanceof Error)
        throw new APIError(
          500,
          "Update Problem Test Cases and Code Informations Error",
          "Failed to get code solutions submission results, please try again",
        );

      // check if all results are correct
      for (let i = 0; i < finalResults.submissions.length; i++) {
        if (finalResults.submissions[i].status.id !== 3) {
          throw new APIError(
            Judge0ErrorIdMap[finalResults.submissions[i].status.id].statusCode,
            "Update Problem Test Cases and Code Informations Error",
            `Test Case ${i + 1} failed for ${codeInfo.language.toUpperCase()} language due to ${Judge0ErrorIdMap[finalResults.submissions[i].status.id].statusMessage}`,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // update test cases and code informations
  existingProblem.testCases = req.body.testCases;
  existingProblem.codeInformations = req.body.codeInformations;

  // save updated problem
  await existingProblem.save();

  // success status to user
  res
    .status(200)
    .json(new APIResponse(200, "Problem Test Cases and Code Informations Updated Successfully"));
});

// @controller DELETE /:problemSlug
export const deleteProblem = asyncHandler(async (req, res) => {
  // find problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem) throw new APIError(404, "Delete Problem Error", "Problem doesn't exist");

  // check if user in not admin and trying to delete other's problem
  if (req.user.role !== UserRolesEnum.ADMIN && req.user.id !== existingProblem.createdBy.toString())
    throw new APIError(
      403,
      "Delete Problem Error",
      "Access Denied for not having required permissions",
    );

  // delete all submissions related to this problem
  await Submission.deleteMany({ problemId: existingProblem._id });

  // delete this problem id entry from all sheets problems array
  const existingSheets = await Sheet.find({ problems: existingProblem._id });

  // loop through all sheets and remove problem id from problems array
  for (const sheet of existingSheets) {
    sheet.problems = sheet.problems.filter(
      problemId => problemId.toString() !== existingProblem._id.toString(),
    );
    await sheet.save();
  }

  // delete problem
  await existingProblem.deleteOne();

  // success status to user
  res.status(200).json(new APIResponse(200, "Problem Deleted Successfully"));
});
