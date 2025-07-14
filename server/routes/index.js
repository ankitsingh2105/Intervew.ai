import express from "express";
import interviewRoute from "./interview.js"
import topicsRoute from "./topics.js";
import authRoute from "./auth.js";

const router = express.Router();

router.use("/interview", interviewRoute);
router.use("/topics", topicsRoute);
router.use("/auth", authRoute);

export default router;