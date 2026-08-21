import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config/config.js'


const getCookieOptions = () => ({
    httpOnly: true,
    secure: CONFIG.NODE_ENV === "production",
    sameSite: CONFIG.NODE_ENV === "production" ? "none" : "lax",
})

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({
        id: user._id,
    }, CONFIG.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("token", token, getCookieOptions())

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
            wishlist: user.wishlist || [],
            address: user.address || ""
        }

    });

}

export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body

    try {
        const existingUser = await userModel.findOne({
            $or: [{ email }, { contact }]
        })

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        const user = await userModel.create({ email, contact, password, fullname, role: isSeller ? "seller" : "buyer" })

        await sendTokenResponse(user, res, "User registered successfully")

    } catch (error) {
        console.error("Register error:", error.message, error)
        res.status(500).json({ message: "Error registering user", error: error.message })
    }
}

export const login = async (req, res) => {
    const { email, contact, password } = req.body;
    try {
        const query = email ? { email } : { contact };
        const user = await userModel.findOne(query);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        await sendTokenResponse(user, res, "Login successful");
    } catch (error) {
        console.error("Login error:", error.message, error);
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
}


export const googleCallback = async (req, res) => {
    const frontendUrl = CONFIG.FRONTEND_URL || "http://localhost:5173"
    try {
        const profile = req.user
        const email = profile.emails?.[0]?.value
        const fullname = profile.displayName || "Google User"

        if (!email) {
            return res.redirect(`${frontendUrl}/login?error=no_email`)
        }

        let user = await userModel.findOne({ email })

        if (!user) {
            const role = req.query.state || "buyer"
            // Create a Google-authenticated user (no password needed)
            user = await userModel.create({
                email,
                fullname,
                contact: "google",
                password: Math.random().toString(36) + Date.now().toString(36), // placeholder
                role: role === "seller" ? "seller" : "buyer"
            })
        }

        const token = jwt.sign({ id: user._id }, CONFIG.JWT_SECRET, { expiresIn: "7d" })
        res.cookie("token", token, getCookieOptions())
        if (user.role === "seller") {
            res.redirect(`${frontendUrl}/seller/dashboard`)
        } else {
            res.redirect(`${frontendUrl}/`)
        }
    } catch (error) {
        console.error("Google callback error:", error)
        res.redirect(`${frontendUrl}/login?error=google_failed`)
    }
}

export const getMe = async (req, res) => {
    const user = req.user
    res.status(200).json({
        message: "User retrieved successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role,
            wishlist: user.wishlist || [],
            address: user.address || ""
        }
    })
}

export const logout = async (req, res) => {
    res.clearCookie("token", getCookieOptions())
    res.status(200).json({
        message: "Logout successful",
        success: true
    })
}

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const wishlist = user.wishlist || [];
        const index = wishlist.findIndex((id) => id.toString() === productId);

        if (index > -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(productId);
        }

        user.wishlist = wishlist;
        await user.save();

        return res.status(200).json({
            message: "Wishlist updated",
            success: true,
            wishlist: user.wishlist,
        });
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        return res.status(500).json({ message: "Error updating wishlist", success: false });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        return res.status(200).json({
            success: true,
            wishlist: user?.wishlist || [],
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({ message: "Error fetching wishlist", success: false });
    }
};

export const updateProfile = async (req, res) => {
    const { fullname, contact, address } = req.body;
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        if (fullname !== undefined) user.fullname = fullname;
        if (contact !== undefined) user.contact = contact;
        if (address !== undefined) user.address = address;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: {
                id: user._id,
                email: user.email,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role,
                wishlist: user.wishlist || [],
                address: user.address || ""
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message, success: false });
    }
};