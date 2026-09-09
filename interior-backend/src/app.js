const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { corsOriginDelegate, isOriginAllowed } = require("./config/corsOrigins");

const authRoutes = require("./routes/authRoutes");
const disciplineRoutes = require("./routes/disciplineRoutes");
const projectRoutes = require("./routes/projectRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const districtRoutes = require("./routes/districtRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");
const eventRoutes = require("./routes/eventRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const locationRoutes = require("./routes/locationRoutes");
const contentBlockRoutes = require("./routes/contentBlockRoutes");
const studioRoutes = require("./routes/studioRoutes");
const mediaLibraryRoutes = require("./routes/mediaLibraryRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

const app = express();

app.use(
  cors({
    origin: corsOriginDelegate,
    credentials: true,
  }),
);

/**
 * The `cors` package doesn't reject disallowed origins on its own — it just
 * omits the CORS headers and calls next(), leaving the request to fall
 * through to routes/Express's default handler (an HTML 500 page). Block it
 * here explicitly with a clean 403 JSON response instead.
 */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }
  next();
});

app.use(express.json());

/** Liveness only — no DB. Useful if the process is up but Postgres is paused. */
function healthPayload(req, res) {
  res.status(200).json({ status: "ok" });
}

/**
 * Uptime / keep-warm probe. Runs a real DB round-trip so Supabase free-tier
 * inactivity pause is less likely (API traffic alone does not count).
 */
async function pingWithDb(req, res) {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "up" });
  } catch (error) {
    console.error("[ping] database check failed:", error.message);
    res.status(503).json({
      status: "degraded",
      db: "down",
      message: error.message,
    });
  }
}

// /health = process alive (may be intercepted on some hosts)
app.get("/health", healthPayload);
// /api/ping = process + database (wire UptimeRobot here)
app.get("/api/ping", pingWithDb);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vinayak Interiors API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/disciplines", disciplineRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/content-blocks", contentBlockRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/media-library", mediaLibraryRoutes);
app.use("/api/chatbot", chatbotRoutes);

module.exports = app;
