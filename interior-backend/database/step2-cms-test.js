/**
 * Step 2 — CMS branch isolation smoke tests (run with server on :5000)
 * Usage: node database/step2-cms-test.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const BASE = `http://localhost:${process.env.PORT || 5000}`;

async function req(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { ok: res.ok, status: res.status, json };
}

async function main() {
  const results = [];

  const push = (name, pass, detail) => results.push({ name, pass, detail });

  const health = await req("GET", "/");
  push("GET / health", health.ok, health.json);

  const login = await req("POST", "/api/auth/login", {
    email: "integration-test@vinayaka.local",
    password: "TestPass123!",
  });
  const token = login.json?.token;
  push("POST /api/auth/login", login.ok && !!token, login.json?.message || login.status);

  const projects = await req("GET", "/api/projects");
  push(
    "GET /api/projects",
    projects.ok && Array.isArray(projects.json?.projects),
    `count=${projects.json?.projects?.length ?? 0}`,
  );

  const disciplines = await req("GET", "/api/disciplines");
  push(
    "GET /api/disciplines",
    disciplines.ok && Array.isArray(disciplines.json?.disciplines),
    `count=${disciplines.json?.disciplines?.length ?? 0}`,
  );

  const districts = await req("GET", "/api/districts");
  push(
    "GET /api/districts",
    districts.ok && Array.isArray(districts.json?.districts),
    `count=${districts.json?.districts?.length ?? 0}`,
  );

  const settings = await req("GET", "/api/site-settings");
  push("GET /api/site-settings", settings.ok, settings.json?.success);

  const slug = `step2-discipline-${Date.now()}`;
  const createDisc = await req(
    "POST",
    "/api/disciplines",
    {
      slug,
      title: "Step2 Test Discipline",
      display_order: 99,
      budget_range: "2.5L–3L",
    },
    token,
  );
  push("POST /api/disciplines (auth)", createDisc.ok, createDisc.json?.discipline?.slug || createDisc.status);

  const contact = await req("POST", "/api/contact", {
    name: "Step2 CMS Contact",
    email: "step2cms@test.com",
    phone: "+919999999999",
    space: "2 BHK",
    style: "Minimal",
    message: "Step 2 isolation test",
  });
  push(
    "POST /api/contact",
    contact.ok && contact.json?.data?.space_type === "2 BHK",
    contact.json?.data?.style || contact.status,
  );

  const leads = await req("GET", "/api/contact/recent-leads");
  push(
    "GET /api/contact/recent-leads",
    leads.ok && Array.isArray(leads.json?.data),
    `count=${leads.json?.data?.length ?? 0}`,
  );

  console.log("\n=== Step 2A: CMS branch (tarunica-backend + your DB) ===\n");
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
