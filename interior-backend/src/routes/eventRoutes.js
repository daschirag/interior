const express = require("express");
const { logEvent } = require("../controllers/eventController");

const router = express.Router();

router.post("/", logEvent);

module.exports = router;
