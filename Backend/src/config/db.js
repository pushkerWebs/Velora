import mongoose, { mongo } from "mongoose";
import { CONFIG } from "./config.js";



const connectToDatabase = async () =>{
    await mongoose.connect(CONFIG.MONGO_URI)
    console.log("Mongodb connected")
}

export default connectToDatabase