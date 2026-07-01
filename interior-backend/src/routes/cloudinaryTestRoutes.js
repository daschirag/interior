const express = require("express");
const router = express.Router();

const {
  testCloudinary,
} = require("../controllers/cloudinaryTest");

router.get("/", testCloudinary);

module.exports = router;