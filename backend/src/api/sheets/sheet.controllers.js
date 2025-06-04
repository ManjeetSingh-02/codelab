// import package modules
import slugify from "slugify";

// import local modules
import { asyncHandler } from "../../utils/async-handler.js";
import { SheetStatusEnum } from "../../utils/constants.js";
import { APIError } from "../error.api.js";
import { APIResponse } from "../response.api.js";
import { Sheet } from "./sheet.models.js";

// @controller GET /
export const getAllSheets = asyncHandler(async (_, res) => {
  // get all sheets
  const allSheets = await Sheet.find({ status: SheetStatusEnum.PUBLIC }).select(
    "-createdBy -status -__v ",
  );

  // success status to user
  return res.status(200).json(new APIResponse(200, "All sheets fetched successfully", allSheets));
});

// @controller GET /:sheetSlug
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

// @controller GET /user/all-sheets
export const getAllSheetsCreatedByUser = asyncHandler(async (req, res) => {
  // find all sheets created by user
  const allSheets = await Sheet.find({ createdBy: req.user.id }).select("-__v -createdBy");

  // success status to user
  return res
    .status(200)
    .json(new APIResponse(200, "All sheets created by user fetched successfully", allSheets));
});

// @controller POST /
export const createSheet = asyncHandler(async (req, res) => {
  // get data from body
  const { title, description } = req.body;

  // check if sheet with same title already exists which is created by user
  const existingSheet = await Sheet.findOne({
    title,
    createdBy: req.user.id,
  });
  if (existingSheet)
    throw new APIError(
      400,
      "Create Sheet Error",
      "Sheet with same title already exists for current user",
    );

  // create new sheet
  const newSheet = await Sheet.create({
    title,
    description,
    createdBy: req.user.id,
    slug: slugify(title, { lower: true, strict: true }),
  });
  if (!newSheet)
    throw new APIError(500, "Create Sheet Error", "Something went wrong while creating sheet");

  // success status to user
  return res.status(201).json(
    new APIResponse(201, "Sheet created successfully", {
      _id: newSheet._id,
      title: newSheet.title,
      description: newSheet.description,
      status: newSheet.status,
      slug: newSheet.slug,
      createdAt: newSheet.createdAt,
      updatedAt: newSheet.updatedAt,
    }),
  );
});

// @controller PATCH /:sheetSlug/add-problem
export const addProblemToSheet = asyncHandler(async (req, res) => {});

// @controller PATCH /:sheetSlug/remove-problem
export const removeProblemFromSheet = asyncHandler(async (req, res) => {});

// @controller DELETE /:sheetSlug
export const deleteSheet = asyncHandler(async (req, res) => {});
