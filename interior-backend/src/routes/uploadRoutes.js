const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const { getUploadAuth } = require("../controllers/uploadAuthController");

router.get("/upload-auth", authenticateToken, getUploadAuth);

module.exports = router;
