const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getProjects,
  getProjectHistory,
  createProject,
  updateProject,
  restoreProjectVersion,
  resetProjectToDefault,
  deleteProject,
} = require("../controllers/projectController");

router.get("/", getProjects);

router.get("/:id/history", authenticateToken, getProjectHistory);
router.post(
  "/:id/restore/:historyId",
  authenticateToken,
  restoreProjectVersion,
);
router.post(
  "/:id/reset-to-default",
  authenticateToken,
  resetProjectToDefault,
);

router.post("/", authenticateToken, createProject);
router.put("/:id", authenticateToken, updateProject);
router.delete("/:id", authenticateToken, deleteProject);

module.exports = router;
