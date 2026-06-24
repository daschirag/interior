const express = require("express");

const {
  submitContact,
  getRecentLeads,
} = require("../controllers/contactController");

const router = express.Router();
router.get("/recent-leads", getRecentLeads);
router.post("/", submitContact);

module.exports = router;
