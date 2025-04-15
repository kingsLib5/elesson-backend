// routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser, getUserDetails, updateUserDetails, forgotPassword } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); // Import the middleware

const router = express.Router();

// Register Route
router.post("/register", registerUser);

// Login Route
router.post("/login", loginUser);

// Details Route (protected)
router.get("/details", authMiddleware, getUserDetails);

// NEW endpoint for updating details (profile image)
router.put("/details", authMiddleware, updateUserDetails);

router.post("/forgot-password", forgotPassword);



module.exports = router;
