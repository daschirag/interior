const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getDisciplines,
  getDisciplineHistory,
  createDiscipline,
  updateDiscipline,
  restoreDisciplineVersion,
  resetDisciplineToDefault,
  deleteDiscipline,
} = require("../controllers/disciplineController");

router.get("/", getDisciplines);

router.get("/:id/history", authenticateToken, getDisciplineHistory);
router.post(
  "/:id/restore/:historyId",
  authenticateToken,
  restoreDisciplineVersion,
);
router.post(
  "/:id/reset-to-default",
  authenticateToken,
  resetDisciplineToDefault,
);

router.post("/", authenticateToken, createDiscipline);
router.put("/:id", authenticateToken, updateDiscipline);
router.delete("/:id", authenticateToken, deleteDiscipline);

module.exports = router;
