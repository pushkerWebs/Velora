import productRouter from "./routes/product.routes.js"
import authRouter from "./routes/auth.routes.js"
import cartRouter from "./routes/cart.routes.js"
import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import cors from "cors"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { CONFIG } from "./config/config.js"


const app = express()
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
}))
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(passport.initialize())

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
console.log("CLIENT SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("BACKEND:", process.env.BACKEND_URL);

passport.use(new GoogleStrategy({
    clientID: CONFIG.GOOGLE_CLIENT_ID,
    clientSecret: CONFIG.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/auth/callback` : "/api/auth/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile)
}));

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" })
})

app.use("/api/auth", authRouter)

app.use("/api/products", productRouter)

app.use("/api/cart", cartRouter)

export default app
