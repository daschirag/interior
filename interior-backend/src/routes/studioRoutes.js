const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getStudios,
  getStudio,
  createStudio,
  updateStudio,
  deleteStudio,
} = require("../controllers/studioController");

router.get("/", getStudios);
router.get("/:id", getStudio);

router.post("/", authenticateToken, createStudio);
router.put("/:id", authenticateToken, updateStudio);
router.delete("/:id", authenticateToken, deleteStudio);

module.exports = router;
