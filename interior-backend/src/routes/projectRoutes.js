const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

router.get("/", getProjects);

router.post(
  "/",
  authenticateToken,
  createProject
);

router.put(
  "/:id",
  authenticateToken,
  updateProject
);

router.delete(
  "/:id",
  authenticateToken,
  deleteProject
);

module.exports = router;