const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimit");

const {
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

// No public registration — admins are created with scripts/create-admin.js.
router.post("/login", loginLimiter, login);

router.get(
  "/profile",
  authenticateToken,
  getProfile
);

router.put(
  "/profile",
  authenticateToken,
  updateProfile
);

console.log("AUTH ROUTES LOADED");

module.exports = router;