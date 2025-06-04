// import local modules
import { asyncHandler } from "../../utils/async-handler.js";
import { SheetStatusEnum } from "../../utils/constants.js";
import { APIError } from "../error.api.js";
import { APIResponse } from "../response.api.js";
import { Sheet } from "./sheet.models.js";

// @route GET /
export const getAllSheets = asyncHandler(async (_, res) => {
  // get all sheets
  const allSheets = await Sheet.find({ status: SheetStatusEnum.PUBLIC }).select(
    "-createdBy -status -__v ",
  );

  // success status to user
  return res.status(200).json(new APIResponse(200, "All sheets fetched successfully", allSheets));
});

// @route GET /:sheetSlug
export const getOneSheet = asyncHandler(async (req, res) => {
  // find sheet by slug
  const existingSheet = await Sheet.findOne({
    slug: req.params.sheetSlug,
    $or: [
      { status: SheetStatusEnum.PUBLIC },
      { $and: [{ status: SheetStatusEnum.PRIVATE }, { createdBy: req.user.id }] },
    ],
  })
    .select("-__v")
    .populate("problems", "_id title difficulty tags slug solvedBy")
    .populate("createdBy", "_id username");
  if (!existingSheet) throw new APIError(404, "Get Sheet Error", "Sheet not found or is private");

  // success status to user
  return res.status(200).json(new APIResponse(200, "Sheet fetched successfully", existingSheet));
});

// @route GET /user/all-sheets
export const getAllSheetsCreatedByUser = asyncHandler(async (req, res) => {
  // find all sheets created by user
  const allSheets = await Sheet.find({ createdBy: req.user.id }).select("-__v -createdBy");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "All sheets created by user fetched successfully", allSheets));
});

// @route POST /
export const createSheet = asyncHandler(async (req, res) => {});

// @route PATCH /:sheetSlug/add-problem
export const addProblemToSheet = asyncHandler(async (req, res) => {});

// @route PATCH /:sheetSlug/remove-problem
export const removeProblemFromSheet = asyncHandler(async (req, res) => {});

// @route DELETE /:sheetSlug
export const deleteSheet = asyncHandler(async (req, res) => {});
