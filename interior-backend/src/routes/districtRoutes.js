const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getDistricts,
  getDistrictBySlug,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} = require("../controllers/districtController");

router.get("/", getDistricts);
router.get("/:slug", getDistrictBySlug);

router.post(
  "/",
  authenticateToken,
  createDistrict
);

router.put(
  "/:id",
  authenticateToken,
  updateDistrict
);

router.delete(
  "/:id",
  authenticateToken,
  deleteDistrict
);

module.exports = router;