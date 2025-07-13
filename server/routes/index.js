import express from "express";
import interviewRoute from "./interview.js"
import topicsRoute from "./topics.js";


const router = express.Router();


router.use("/interview", interviewRoute);
router.use("/topics", topicsRoute);


export default router;