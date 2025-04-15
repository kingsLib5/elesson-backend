// routes/adminRoutes.js (example)
const express = require("express");
const { getUserCount, getAllUsers } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  res.status(200).json({ message: "Welcome to the Admin Dashboard", user: req.user });
});

router.get("/usercount", authMiddleware, adminMiddleware, getUserCount);

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);


module.exports = router;
