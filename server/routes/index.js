import express from "express";
import interviewRoute from "./interview.js"
import topicsRoute from "./topics.js";
import authRoute from "./auth.js";
import { getCacheStats } from "../utils/resumeParser.js";

const router = express.Router();

router.use("/interview", interviewRoute);
router.use("/topics", topicsRoute);
router.use("/auth", authRoute);

// Cache statistics endpoint (for debugging)
router.get("/cache-stats", (req, res) => {
  const stats = getCacheStats();
  res.json({ success: true, ...stats });
});

export default router;