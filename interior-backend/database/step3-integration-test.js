/**
 * Step 3 — unified backend smoke tests (single server on :5000)
 * Usage: node database/step3-integration-test.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const BASE = `http://localhost:${process.env.PORT || 5000}`;

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(
      `Cannot reach ${BASE}${path}. Start the server first in another terminal:\n` +
        "  cd interior-backend\n" +
        "  npm start\n\n" +
        "Or run everything in one command:\n" +
        "  npm run test:integration:full",
    );
  }
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const results = [];
  const push = (name, pass, detail) => results.push({ name, pass, detail });

  const health = await req("GET", "/");
  push("GET / unified health", health.ok, health.json?.message);

  const login = await req("POST", "/api/auth/login", {
    email: "integration-test@vinayaka.local",
    password: "TestPass123!",
  });
  const token = login.json?.token;
  push("CMS login", login.ok && !!token, login.json?.message || login.status);

  const event = await req("POST", "/api/events", {
    eventType: "page_view",
    page: "index.html",
    visitorId: "step3-unified",
    referrer: "Direct",
    meta: { device: "Desktop" },
  });
  push("POST /api/events", event.ok, event.json?.data?.event_type);

  const contact = await req("POST", "/api/contact", {
    name: "Step3 Unified",
    email: "step3@test.com",
    phone: "+917777777777",
    city: "Bengaluru",
    space: "4 BHK",
    style: "Luxury",
    message: "Unified server test",
  });
  push("POST /api/contact", contact.ok, contact.json?.data?.city || contact.json?.data?.space_type);

  const summary = await req("GET", "/api/analytics/summary?period=all", null, token);
  push(
    "GET /api/analytics/summary (auth)",
    summary.ok && summary.json?.success,
    `pageViews=${summary.json?.data?.pageViews ?? "?"}`,
  );

  const trends = await req("GET", "/api/analytics/trends?period=7", null, token);
  push("GET /api/analytics/trends (auth)", trends.ok, `points=${trends.json?.data?.length ?? 0}`);

  const leads = await req("GET", "/api/contact/recent-leads", null, token);
  push("GET /api/contact/recent-leads (auth)", leads.ok, `count=${leads.json?.data?.length ?? 0}`);

  const projects = await req("GET", "/api/projects");
  push("GET /api/projects", projects.ok, `count=${projects.json?.projects?.length ?? 0}`);

  const featured = await req("GET", "/api/projects?featured=true");
  push("GET /api/projects?featured=true", featured.ok, `count=${featured.json?.projects?.length ?? 0}`);

  const disciplines = await req("GET", "/api/disciplines");
  push("GET /api/disciplines", disciplines.ok, `count=${disciplines.json?.disciplines?.length ?? 0}`);

  const settings = await req("GET", "/api/site-settings");
  push("GET /api/site-settings", settings.ok, settings.json?.settings?.email || "no settings row");

  const districts = await req("GET", "/api/districts");
  push("GET /api/districts", districts.ok, `count=${districts.json?.districts?.length ?? 0}`);

  console.log("\n=== Step 3: Unified interior-backend ===\n");
  let failed = 0;
  for (const r of results) {
    const mark = r.pass ? "PASS" : "FAIL";
    if (!r.pass) failed++;
    console.log(`${mark}  ${r.name}  —  ${r.detail}`);
  }
  console.log(`\n${results.length - failed}/${results.length} passed\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
