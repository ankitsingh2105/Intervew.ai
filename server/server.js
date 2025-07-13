import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes/index.js";
import connectDB from "./config/db.js";
import { initializeResumeCache } from "./utils/resumeParser.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Interview.ai API is running",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
    
    // Initialize resume cache after server starts
    await initializeResumeCache();
}).catch((err) => {
  console.log(err);
});
