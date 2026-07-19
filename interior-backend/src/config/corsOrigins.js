/** Local dev origins — always allowed unless DISALLOW_LOCAL_ORIGINS=true */
const LOCAL_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(origin || ""));
}

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

/**
 * Express `cors` origin callback — allows listed origins plus any localhost port
 * (unless DISALLOW_LOCAL_ORIGINS=true).
 */
function corsOriginDelegate(origin, callback) {
  // Same-origin / curl / server-to-server (no Origin header)
  if (!origin) {
    callback(null, true);
    return;
  }

  if (
    process.env.DISALLOW_LOCAL_ORIGINS !== "true" &&
    isLocalDevOrigin(origin)
  ) {
    callback(null, true);
    return;
  }

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Not allowed by CORS"));
}

module.exports = {
  getAllowedOrigins,
  LOCAL_DEV_ORIGINS,
  isLocalDevOrigin,
  corsOriginDelegate,
};
