const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getDisciplines,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
} = require("../controllers/disciplineController");

router.get("/", getDisciplines);

router.post(
  "/",
  authenticateToken,
  createDiscipline
);

router.put(
  "/:id",
  authenticateToken,
  updateDiscipline
);

router.delete(
  "/:id",
  authenticateToken,
  deleteDiscipline
);

module.exports = router;