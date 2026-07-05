const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const disciplineRoutes = require("./routes/disciplineRoutes");
const projectRoutes = require("./routes/projectRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const districtRoutes = require("./routes/districtRoutes");
const cloudinaryTestRoutes = require("./routes/cloudinaryTestRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");
const eventRoutes = require("./routes/eventRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const locationRoutes = require("./routes/locationRoutes");
const contentBlockRoutes = require("./routes/contentBlockRoutes");
const studioRoutes = require("./routes/studioRoutes");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin
      ? {
          origin: corsOrigin.split(",").map((o) => o.trim()),
        }
      : undefined,
  ),
);
app.use(express.json());

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
app.use("/api/cloudinary-test", cloudinaryTestRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/content-blocks", contentBlockRoutes);
app.use("/api/studios", studioRoutes);

app.use((error, req, res, next) => {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Image is too large. Maximum size is 5 MB.",
    });
  }

  if (error?.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }

  return next(error);
});

module.exports = app;
