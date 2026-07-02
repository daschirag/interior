const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadImage,
} = require("../controllers/uploadController");

router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  uploadImage
);

module.exports = router;