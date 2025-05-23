// import package modules
import { Router } from "express";

// import local modules
import { healthCheck } from "./healthcheck.controllers.js";

// create a new router
const router = Router();

// @route GET /
router.get("/", healthCheck);

// export router
export default router;
