import express from "express";
<<<<<<< HEAD
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
=======
import { 
  startInterviewController, 
  continueInterviewController
} from "../controllers/interviewController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Interview Flow Routes (Protected)
router.post("/start", authMiddleware, startInterviewController);
router.post("/continue", authMiddleware, continueInterviewController);
>>>>>>> c1dc60387f6f18159132f55403dae123013791f5

export default router;
