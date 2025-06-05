// import package modules
import { Router } from "express";

// import local modules
import { isLoggedIn, isVerified, validateSchema } from "../../../utils/route-protector.js";
import {
  addProblemToSheet,
  createSheet,
  deleteSheet,
  getAllSheets,
  getAllSheetsCreatedByUser,
  getOneSheet,
  removeProblemFromSheet,
} from "./sheet.controllers.js";
import { createSheetSchema, updateProblemIntoSheetSchema } from "./sheet.zodschemas.js";

// create a new router
const router = Router();

// @route GET /
router.get("/", isLoggedIn, isVerified, getAllSheets);

// @route GET /:sheetSlug
router.get("/:sheetSlug", isLoggedIn, isVerified, getOneSheet);

// @route GET /user/all-sheets
router.get("/user/all-sheets", isLoggedIn, isVerified, getAllSheetsCreatedByUser);

// @route POST /
router.post("/", isLoggedIn, isVerified, validateSchema(createSheetSchema), createSheet);

// @route PATCH /:sheetSlug/add-problem
router.patch(
  "/:sheetSlug/add-problem",
  isLoggedIn,
  isVerified,
  validateSchema(updateProblemIntoSheetSchema),
  addProblemToSheet,
);

// @route PATCH /:sheetSlug/remove-problem
router.patch(
  "/:sheetSlug/remove-problem",
  isLoggedIn,
  isVerified,
  validateSchema(updateProblemIntoSheetSchema),
  removeProblemFromSheet,
);

// @route DELETE /:sheetSlug
router.delete("/:sheetSlug", isLoggedIn, isVerified, deleteSheet);

// export router
export default router;
