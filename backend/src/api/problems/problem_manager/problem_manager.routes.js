// import package modules
import { Router } from "express";

// create a new router
const problemManagerRouter = Router();

// @route GET /test
problemManagerRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "problemManager route is working!" });
});

// export router
export { problemManagerRouter };
