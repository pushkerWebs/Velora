import app from "./src/app.js"
import mongoose from "mongoose"
import { CONFIG } from "./src/config/config.js"

async function startServer() {
    try {
        await mongoose.connect(CONFIG.MONGO_URI)
        console.log("MongoDB connected")

        app.listen(3000, () => {
            console.log("Server running on port 3000")
        })
    } catch (error) {
        console.error("Failed to start server:", error.message)
        process.exit(1)
    }
}

startServer()
