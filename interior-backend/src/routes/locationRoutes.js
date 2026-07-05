const express = require("express");
const {
  getKarnatakaLocations,
  searchKarnatakaLocations,
} = require("../controllers/locationController");

const router = express.Router();

router.get("/karnataka", getKarnatakaLocations);
router.get("/karnataka/search", searchKarnatakaLocations);

module.exports = router;
