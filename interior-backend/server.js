require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

pool
  .connect()
  .then((client) => {
    client.release();
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    console.error(
      "Server will start anyway; fix DATABASE_URL / DB_* env vars on Render.",
    );
  });

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
