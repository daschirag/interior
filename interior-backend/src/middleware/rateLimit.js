const { rateLimit } = require("express-rate-limit");

/**
 * 5 failed logins per 15 minutes per client IP. Successful logins don't count.
 * Relies on `app.set("trust proxy", 1)` so req.ip is the visitor, not Render's proxy.
 * In-memory store: counts reset when the server restarts (fine for a single instance).
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many failed login attempts. Please try again in 15 minutes.",
    });
  },
});

module.exports = { loginLimiter };
