import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // For now, skip database connection since we're not using it
        // await mongoose.connect("mongodb://localhost:27017/interview-ai");
        console.log("Database connection skipped - using in-memory storage");
    } catch (err) {
        console.log("MONGODB connection FAILED", err);
        throw err;
    }
};

export default connectDB;
