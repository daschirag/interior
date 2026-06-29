const express = require("express");
const router = express.Router();

const {
  getAnalyticsSummary,
  getTrafficTrends,
} = require("../controllers/analyticsController");

// Summary Cards
router.get("/summary", getAnalyticsSummary);

// Traffic Trend Chart
router.get("/trends", getTrafficTrends);

module.exports = router;
