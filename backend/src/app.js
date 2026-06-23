const express = require("express");
const cors = require("cors");

const contactRoutes = require("./routes/contactRoutes");

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

module.exports = app;
