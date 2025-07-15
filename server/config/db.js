import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // For now, skip database connection since we're not using it
        const mongoURI = process.env.MONGO_URI;
        await mongoose.connect(mongoURI);
        console.log("Database connected successfully");
    } catch (err) {
        console.log("MONGODB connection FAILED", err);
        throw err;
    }
};

export default connectDB;
