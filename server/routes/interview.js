import express from "express";
import {
  startInterviewController,
  continueInterviewController
} from "../controllers/interviewController.js";


const router = express.Router();

// POST /api/process/start - Generate initial welcome message for topic or combination
router.post("/start/:topicId",startInterviewController);

// POST /api/process - Continue interview conversation
router.post("/continue/:topicId",  continueInterviewController);

export default router;
