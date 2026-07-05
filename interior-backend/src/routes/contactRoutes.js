const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  submitContact,
  getRecentLeads,
} = require("../controllers/contactController");

const router = express.Router();

router.post("/", submitContact);
router.get("/recent-leads", authenticateToken, getRecentLeads);

module.exports = router;
