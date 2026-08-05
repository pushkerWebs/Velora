import dotenv from "dotenv";

dotenv.config()

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in .env")
}
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env")
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in .env")
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in .env")
}
if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in .env")
}


export const CONFIG = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development",
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    PORT: process.env.PORT || 5000,
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000"
}