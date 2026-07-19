const express = require("express");
const cors = require("cors");
const { corsOriginDelegate } = require("./config/corsOrigins");

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
app.use(express.json());

function healthPayload(req, res) {
  res.status(200).json({ status: "ok" });
}

// /health works locally; Render may intercept this path before it reaches the app.
app.get("/health", healthPayload);
app.get("/api/ping", healthPayload);

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
