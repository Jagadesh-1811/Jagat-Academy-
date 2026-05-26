import mongoose from "mongoose";
import dns from "dns";

// Force Google DNS to fix ISP SRV record blocking
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDb = async () => {
    const mongoUri = process.env.MONGODB_URL || process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MongoDB connection string is missing. Set MONGODB_URL or MONGO_URI in backend/.env");
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("DB connected");
    } catch (error) {
        console.error("DB connection error:", error.message);
        throw error;
    }
}
export default connectDb