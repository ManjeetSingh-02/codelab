// import package modules
import { Router } from "express";

// create a new router
const userRouter = Router();

// @route GET /test
userRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "user route is working!" });
});

// export router
export { userRouter };
