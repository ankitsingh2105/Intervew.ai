import express from "express";
import { 
  startInterviewController, 
  continueInterviewController
} from "../controllers/interviewController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Interview Flow Routes (Protected)
router.post("/start", authMiddleware, startInterviewController);
router.post("/continue", authMiddleware, continueInterviewController);

export default router;
