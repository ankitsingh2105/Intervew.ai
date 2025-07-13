import express from "express";
import {
  getAllTopicsController,
  getIndividualTopicsController,
  getTopicCombinationsController,
  createCustomCombinationController,
  getTopicByIdController
} from "../controllers/topicController.js";

const router = express.Router();

// GET /api/topics - Get all available interview topics (individual + combinations)
router.get("/", getAllTopicsController);

// GET /api/topics/individual - Get only individual topics
router.get("/individual", getIndividualTopicsController);

// GET /api/topics/combinations - Get only topic combinations
router.get("/combinations", getTopicCombinationsController);

// POST /api/topics/custom - Create custom topic combination
router.post("/custom", createCustomCombinationController);

// GET /api/topics/:id - Get specific topic or combination by ID
router.get("/:id", getTopicByIdController);

export default router; 