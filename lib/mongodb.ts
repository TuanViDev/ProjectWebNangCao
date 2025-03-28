import mongoose, { mongo } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/store";

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

async function dbConnect() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }
    const opts  = {
        bufferCommands: false,
    }
    await mongoose.connect(MONGODB_URI, opts);
    return mongoose;
}

export default dbConnect;