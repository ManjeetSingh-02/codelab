// import local modules
import { asyncHandler } from "../../../utils/async-handler.js";
import { APIError } from "../../error.api.js";
import { Problem } from "../problems/problem.models.js";
import { APIResponse } from "../../response.api.js";
import { Submission } from "./submission.models.js";

// @controller GET /
export const getAllUserSubmissions = asyncHandler(async (req, res) => {
  // get all submissions made by the user
  const allSubmissions = await Submission.find({ userId: req.user.id })
    .select("-userId -testCases -__v -updatedAt")
    .populate("problemId", "title slug difficulty tags");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "All user submissions fetched successfully", allSubmissions));
});

// @controller GET /:problemSlug
export const getAllProblemSubmissions = asyncHandler(async (req, res) => {
  // get problem by slug
  const existingProblem = await Problem.findOne({ slug: req.params.problemSlug });
  if (!existingProblem)
    throw new APIError(404, "Get all Problem Submissions Error", "Problem not found");

  // get all submissions made by the user for a specific problem
  const allSubmissions = await Submission.find({
    problemId: existingProblem._id,
    userId: req.user.id,
  }).select("language status createdAt");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "All problem submissions fetched successfully", allSubmissions));
});
