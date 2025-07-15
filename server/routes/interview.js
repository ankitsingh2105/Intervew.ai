import express from "express";
import multer from "multer";
import {
  startInterviewController,
  processInterviewController
} from "../controllers/interviewController.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// POST /api/interview/start - Start new interview with resume and parameters
router.post("/start", upload.single('resume'), startInterviewController);

// POST /api/interview/process - Continue interview conversation
router.post("/process", processInterviewController);

export default router;
