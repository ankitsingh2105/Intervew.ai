import express from "express";
import multer from "multer";
import {
  startInterviewController,
  processInterviewController
} from "../controllers/interviewController.js";
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// POST /api/interview/start - Start new interview with resume and parameters
router.post("/start",authMiddleware, upload.single('resume'), startInterviewController);

// POST /api/interview/process - Continue interview conversation
router.post("/process",authMiddleware, processInterviewController);

export default router;
