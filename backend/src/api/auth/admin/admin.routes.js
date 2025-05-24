// import package modules
import { Router } from "express";

// create a new router
const adminRouter = Router();

// @route GET /test
adminRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "Admin route is working!" });
});

// export router
export { adminRouter };
