import { Router } from "express";
import {
  validateRegisterUser,
  validateLoginUser,
} from "../validator/auth.validator.js";
import {
  register,
  login,
  googleCallback,
  getMe,
  logout,
  toggleWishlist,
  getWishlist
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { CONFIG } from "../config/config.js";

const router = Router();

router.post("/register", validateRegisterUser, register);
router.post("/login", validateLoginUser, login);
router.get(
  "/google",
  (req, res, next) => {
    const role = req.query.role || "buyer";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: role,
    })(req, res, next);
  }
);
router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: CONFIG.NODE_ENV == "development" ? "http://localhost:5173/login" : "/login",
  }),
  googleCallback,
);

router.get('/me',authenticateUser,getMe)
router.post('/logout', logout)
router.post('/wishlist/toggle/:productId', authenticateUser, toggleWishlist)
router.get('/wishlist', authenticateUser, getWishlist)

export default router;
