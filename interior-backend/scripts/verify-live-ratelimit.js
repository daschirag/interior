/**
 * Live check: does the login rate limiter count attempts against the real client IP?
 *
 * WHEN TO RUN: after any change in front of Render (proxy, load balancer, CDN), a new
 * domain for the API, or a Cloudflare setting change — anything that can change the
 * number of proxy hops that TRUST_PROXY_HOPS / DEFAULT_TRUST_PROXY_HOPS in src/app.js
 * relies on.
 *
 * WHAT IT DOES: sends exactly 3 failed logins (a nonexistent email, never a real account)
 * to the production API — one plain, two with different spoofed X-Forwarded-For values —
 * and compares the limiter's partition key (the `pk` in the RateLimit-Policy header, a
 * short hash of the key it counts against) with hashes of our IP as Cloudflare sees it
 * and of the spoofed values. No retries, no loops. It prints no IP addresses, tokens or
 * secrets, and never reads .env. It uses up 3 of YOUR IP's 5 attempts for 15 minutes.
 *
 * HOW TO READ THE RESULT:
 *   - "our real IP" on all 3, attempts left 4, 3, 2  → correct.
 *   - "a proxy address"                               → hop count too low (visitors share
 *                                                       buckets): raise TRUST_PROXY_HOPS.
 *   - "a spoofed X-Forwarded-For value"               → hop count too high (limiter can be
 *                                                       bypassed): lower TRUST_PROXY_HOPS.
 *
 * Usage:  node scripts/verify-live-ratelimit.js --yes
 * Optional: VERIFY_API_BASE_URL=https://other-host node scripts/verify-live-ratelimit.js --yes
 */
const crypto = require("crypto");

const BASE = (process.env.VERIFY_API_BASE_URL || "https://vinayak-interiors-api.onrender.com").replace(/\/+$/, "");
const ORIGIN = "https://www.vinayakaluminiuminterior.com"; // an allowed CORS origin
const TIMEOUT_MS = 30000;

// Same derivation express-rate-limit uses for the `pk` field (IPv4 keys are the IP itself).
const partitionKey = (key) =>
  Buffer.from(crypto.createHash("sha256").update(key).digest("hex").slice(0, 12)).toString("base64");

console.log(
  "WARNING: this sends exactly 3 failed logins to " + BASE + " and uses up 3 of your own\n" +
    "5 login attempts there for 15 minutes. Run it only when you mean to.",
);
if (!process.argv.slice(2).includes("--yes")) {
  console.log("Refusing to run without --yes.  Usage: node scripts/verify-live-ratelimit.js --yes");
  process.exit(2);
}

(async () => {
  // Our IP as Cloudflare sees it — kept in memory only, never printed.
  const traceRes = await fetch(BASE + "/cdn-cgi/trace", { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const myIp = ((await traceRes.text()).match(/^ip=(.+)$/m) || [])[1];
  if (!traceRes.ok || !myIp) {
    throw new Error("Couldn't read our IP from Cloudflare's /cdn-cgi/trace — is the API still behind Cloudflare?");
  }
  if (myIp.includes(":")) {
    throw new Error("Cloudflare sees us over IPv6; the limiter keys IPv6 by /56 subnet, which this check doesn't model. Run it from an IPv4 connection.");
  }

  const spoofA = "198.51.100.23";
  const spoofB = "198.51.100.24"; // documentation-range addresses (RFC 5737), never real clients
  const meaning = {
    [partitionKey(myIp)]: "our real IP",
    [partitionKey(spoofA)]: "a spoofed X-Forwarded-For value",
    [partitionKey(spoofB)]: "a spoofed X-Forwarded-For value",
  };

  const requests = [
    ["no X-Forwarded-For", null],
    ["spoofed X-Forwarded-For A", spoofA],
    ["spoofed X-Forwarded-For B", spoofB],
  ];
  const rows = [];
  for (const [label, xff] of requests) {
    const res = await fetch(BASE + "/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: ORIGIN,
        ...(xff ? { "X-Forwarded-For": xff } : {}),
      },
      body: JSON.stringify({
        email: `nonexistent-ratelimit-check-${Date.now()}@example.invalid`,
        password: "not-a-real-password",
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const policy = res.headers.get("ratelimit-policy") || "";
    if (!policy) {
      console.log(`${label}: HTTP ${res.status}, no RateLimit headers — the limiter isn't active on this deploy. Stopped after this request.`);
      process.exitCode = 1;
      return;
    }
    const pk = (policy.match(/pk=:([^:]+):/) || [])[1];
    const left = ((res.headers.get("ratelimit") || "").match(/r=(\d+)/) || [])[1];
    rows.push({ label, status: res.status, left, key: meaning[pk] || "a proxy address" });
  }

  for (const r of rows) {
    console.log(`${r.label.padEnd(26)} HTTP ${r.status}  attempts left ${r.left}  counted against: ${r.key}`);
  }

  if (rows.every((r) => r.key === "our real IP")) {
    console.log("\nRESULT: correct — every request counted against our real IP; spoofed X-Forwarded-For was ignored.");
  } else if (rows.some((r) => r.key.startsWith("a spoofed"))) {
    console.log("\nRESULT: hop count TOO HIGH — a client can choose its own key with X-Forwarded-For. Lower TRUST_PROXY_HOPS by one and re-check.");
    process.exitCode = 1;
  } else {
    console.log("\nRESULT: hop count TOO LOW — attempts count against proxy addresses, so visitors share buckets. Raise TRUST_PROXY_HOPS by one and re-check.");
    process.exitCode = 1;
  }
})().catch((e) => {
  console.error("Check failed:", e.message);
  process.exitCode = 1;
});
