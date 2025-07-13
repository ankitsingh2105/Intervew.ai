import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import processRoute from "./routes/process.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/process", processRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
