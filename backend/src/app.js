const express = require("express");
const cors = require("cors");

const contactRoutes = require("./routes/contactRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vinayak Interiors Backend Running",
  });
});

app.use("/api/contact", contactRoutes);
app.use("/api/events", eventRoutes);

module.exports = app;
