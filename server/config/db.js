import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.log("MONGODB connection FAILED", err);
        throw err;
    }
};

export default connectDB;
