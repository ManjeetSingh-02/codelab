// import local modules
import { asyncHandler } from "../../utils/async-handler.js";
import { APIError } from "../error.api.js";
import { APIResponse } from "../response.api.js";

// @route GET /
export const getAllSheets = asyncHandler(async (req, res) => {});

// @route GET /:sheetSlug
export const getOneSheet = asyncHandler(async (req, res) => {});

// @route GET /user/all-sheets
export const getAllSheetsCreatedByUser = asyncHandler(async (req, res) => {});

// @route POST /
export const createSheet = asyncHandler(async (req, res) => {});

// @route PATCH /:sheetSlug/add-problem
export const addProblemToSheet = asyncHandler(async (req, res) => {});

// @route PATCH /:sheetSlug/remove-problem
export const removeProblemFromSheet = asyncHandler(async (req, res) => {});

// @route DELETE /:sheetSlug
export const deleteSheet = asyncHandler(async (req, res) => {});
