const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getSettings,
  updateSettings,
} = require("../controllers/siteSettingsController");

router.get("/", getSettings);

router.put(
  "/",
  authenticateToken,
  updateSettings
);

module.exports = router;