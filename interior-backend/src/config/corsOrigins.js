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

/**
 * Known production origins — always allowed regardless of the ALLOWED_ORIGINS
 * env var, so a misconfigured/missing env value can't take the live site down.
 */
const PRODUCTION_ORIGINS = [
  "https://interior-sigma-one.vercel.app",
  "https://www.interior-sigma-one.vercel.app",
  "https://vinayakaluminiuminterior.com",
  "https://www.vinayakaluminiuminterior.com",
];

/**
 * Vercel auto-generates a preview/branch deployment URL for every push, e.g.
 *   https://interior-sigma-one-git-main-daschirag.vercel.app
 *   https://interior-sigma-one-8f3k2a9bc.vercel.app
 * These always start with the project name followed by "-" and end in
 * ".vercel.app", so match that shape instead of listing them one by one.
 */
const VERCEL_PREVIEW_PATTERN =
  /^https:\/\/interior-sigma-one-[a-z0-9-]+\.vercel\.app$/i;

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(origin || ""));
}

function isVercelPreviewOrigin(origin) {
  return VERCEL_PREVIEW_PATTERN.test(String(origin || ""));
}

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;

  const fromEnv = raw
    ? raw
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  const base =
    process.env.DISALLOW_LOCAL_ORIGINS === "true"
      ? [...PRODUCTION_ORIGINS]
      : [...LOCAL_DEV_ORIGINS, ...PRODUCTION_ORIGINS];

  return [...new Set([...base, ...fromEnv])];
}

/**
 * Single source of truth for "is this Origin header allowed". Used both by
 * the `cors` middleware (to decide whether to send CORS headers) and by the
 * rejection middleware in app.js (to decide whether to actually block the
 * request with a 403).
 */
function isOriginAllowed(origin) {
  // Same-origin / curl / server-to-server requests never send an Origin header.
  if (!origin) return true;

  if (
    process.env.DISALLOW_LOCAL_ORIGINS !== "true" &&
    isLocalDevOrigin(origin)
  ) {
    return true;
  }

  if (isVercelPreviewOrigin(origin)) return true;

  return getAllowedOrigins().includes(origin);
}

/**
 * Express `cors` origin callback. Never passes an Error — that would make the
 * `cors` package call next(err) and fall through to Express's default error
 * handler, which returns an HTML 500 page. Instead, resolve with
 * `true`/`false`: an allowed origin gets the CORS headers, a disallowed one
 * gets none (and is turned into a clean 403 JSON response by the
 * corsRejectionHandler middleware in app.js).
 */
function corsOriginDelegate(origin, callback) {
  callback(null, isOriginAllowed(origin));
}

module.exports = {
  getAllowedOrigins,
  LOCAL_DEV_ORIGINS,
  PRODUCTION_ORIGINS,
  isLocalDevOrigin,
  isVercelPreviewOrigin,
  isOriginAllowed,
  corsOriginDelegate,
};
