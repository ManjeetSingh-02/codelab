// import package modules
import { Router } from "express";

// import local modules
import { isLoggedIn, isVerified } from "../../../utils/route-protector.js";
import { getAllProblemSubmissions, getAllUserSubmissions } from "./submission.controllers.js";

// create a new router
const router = Router();

// @route GET /
router.get("/", isLoggedIn, isVerified, getAllUserSubmissions);

// @route GET /:problemSlug
router.get("/:problemSlug", isLoggedIn, isVerified, getAllProblemSubmissions);

// export router
export default router;
