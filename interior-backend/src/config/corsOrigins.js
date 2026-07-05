/** Local dev origins — always allowed unless DISALLOW_LOCAL_ORIGINS=true */
const LOCAL_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;

  if (!raw) {
    return LOCAL_DEV_ORIGINS;
  }

  const fromEnv = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.DISALLOW_LOCAL_ORIGINS === "true") {
    return fromEnv;
  }

  return [...new Set([...LOCAL_DEV_ORIGINS, ...fromEnv])];
}

module.exports = {
  getAllowedOrigins,
  LOCAL_DEV_ORIGINS,
};
