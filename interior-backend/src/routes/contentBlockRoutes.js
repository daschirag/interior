const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getContentBlocks,
  getContentBlock,
  getContentBlockHistory,
  updateContentBlock,
  restoreContentBlockVersion,
  resetContentBlockToDefault,
  createContentBlock,
  deleteContentBlock,
} = require("../controllers/contentBlockController");

router.get("/", getContentBlocks);
router.get("/:sectionKey/history", authenticateToken, getContentBlockHistory);
router.post(
  "/:sectionKey/restore/:historyId",
  authenticateToken,
  restoreContentBlockVersion,
);
router.post(
  "/:sectionKey/reset-to-default",
  authenticateToken,
  resetContentBlockToDefault,
);
router.get("/:sectionKey", getContentBlock);

router.post("/", authenticateToken, createContentBlock);
router.put("/:sectionKey", authenticateToken, updateContentBlock);
router.delete("/:sectionKey", authenticateToken, deleteContentBlock);

module.exports = router;
