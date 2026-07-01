const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const disciplineRoutes = require("./routes/disciplineRoutes");
const projectRoutes = require("./routes/projectRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const districtRoutes = require("./routes/districtRoutes");
const cloudinaryTestRoutes = require("./routes/cloudinaryTestRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Working Successfully");
});

app.use("/api/auth", authRoutes);
app.use("/api/disciplines", disciplineRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/cloudinary-test", cloudinaryTestRoutes);
app.use("/api/upload", uploadRoutes);

module.exports = app;