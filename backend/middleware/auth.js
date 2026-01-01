const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// PUBLIC ROUTES
router.post("/register", authController.registerUser);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.loginUser);

// PROTECTED ROUTES
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/preferences", authMiddleware, authController.updatePreferences);
router.put("/change-password", authMiddleware, authController.changePassword);
router.post("/logout", authMiddleware, authController.logoutUser);

module.exports = router;