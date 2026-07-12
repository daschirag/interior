const express = require("express");
const { postMessage } = require("../controllers/chatbotController");

const router = express.Router();

/** Public — no auth */
router.post("/message", postMessage);

module.exports = router;
