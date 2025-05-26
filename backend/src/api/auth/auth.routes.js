// import package modules
import { Router } from "express";

// import local modules
import { adminRouter } from "./admin/admin.routes.js";
import { userRouter } from "./user/user.routes.js";

// create a new router
const router = Router();

// auth routes
router.use("/admin", adminRouter);
router.use("/user", userRouter);

// export router
export default router;
