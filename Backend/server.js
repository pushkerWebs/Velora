import app from "./src/app.js"
import mongoose from "mongoose"
import { CONFIG } from "./src/config/config.js"

async function startServer() {
    try {
        await mongoose.connect(CONFIG.MONGO_URI)
        console.log("MongoDB connected")

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to start server:", error.message)
        process.exit(1)
    }
}

startServer()
