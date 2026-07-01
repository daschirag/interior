const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  initDatabase,
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

router.get("/init-db", initDatabase);

router.post("/register", register);

router.post("/login", login);

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
router.put("/test-put", (req, res) => {
  res.json({
    success: true,
    message: "PUT route working",
  });
});

module.exports = router;