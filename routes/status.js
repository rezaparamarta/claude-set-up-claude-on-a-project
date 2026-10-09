const express = require("express");

const router = express.Router();

// GET /status — how long the app has been running, in seconds
router.get("/", (req, res) => {
  res.json({ uptimeSeconds: Math.floor(process.uptime()) });
});

module.exports = router;
