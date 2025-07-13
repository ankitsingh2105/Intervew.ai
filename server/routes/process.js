import express from "express";
import { generateGeminiResponse } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { answer, history = [] } = req.body;

  try {
    const reply = await generateGeminiResponse(answer, history);
    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Gemini API failed." });
  }
});

export default router;
