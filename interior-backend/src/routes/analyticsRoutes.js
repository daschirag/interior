const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  getAnalyticsSummary,
  getTrafficTrends,
  getRegionAnalytics,
  getRegionDistricts,
  getVisitorInsights,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/summary", authenticateToken, getAnalyticsSummary);
router.get("/trends", authenticateToken, getTrafficTrends);
router.get("/regions", authenticateToken, getRegionAnalytics);
router.get("/regions/:region/districts", authenticateToken, getRegionDistricts);
router.get("/visitor-insights", authenticateToken, getVisitorInsights);

module.exports = router;
