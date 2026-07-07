const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  listMediaLibrary,
  getMediaUsage,
  getFileUsageCheck,
  deleteMediaFile,
} = require("../controllers/mediaLibraryController");

router.get("/usage", authenticateToken, getMediaUsage);
router.get("/", authenticateToken, listMediaLibrary);
router.get("/:fileId/usage-check", authenticateToken, getFileUsageCheck);
router.delete("/:fileId", authenticateToken, deleteMediaFile);

module.exports = router;
