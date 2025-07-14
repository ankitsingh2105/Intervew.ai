import express from "express";
import { signup, login, oauth, getProfile, updateProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", signup);
router.post("/login", login);
router.post("/oauth", oauth);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router; 