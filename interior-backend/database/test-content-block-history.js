/**
 * Quick API test for content-block history / restore / reset.
 * Run: node database/test-content-block-history.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const ContentBlock = require("../src/models/contentBlockModel");
const ContentBlockHistory = require("../src/models/contentBlockHistoryModel");

const BASE = process.env.API_BASE_URL || "http://localhost:5000/api";
const EMAIL = process.env.TEST_ADMIN_EMAIL || "integration-test@vinayaka.local";
const PASSWORD = process.env.TEST_ADMIN_PASSWORD || "TestPass123!";
const SECTION = "dashboard-hero";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  await ContentBlock.createTable();
  await ContentBlockHistory.createTable();

  const login = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!login.data.success || !login.data.token) {
    console.error("Login failed:", login.status, login.data);
    process.exit(1);
  }

  const token = login.data.token;
  const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const before = await request(`/content-blocks/${SECTION}`);
  const originalFields = { ...(before.data.block?.fields || {}) };
  const originalImages = [...(before.data.block?.images || [])];

  const testKicker = `History test ${Date.now()}`;
  const nextFields = { ...originalFields, kicker: testKicker };

  const put = await request(`/content-blocks/${SECTION}`, {
    method: "PUT",
    headers: auth,
    body: JSON.stringify({ fields: nextFields, images: originalImages }),
  });
  console.log("PUT update:", put.status, put.data.success ? "ok" : put.data);

  const history = await request(`/content-blocks/${SECTION}/history`, { headers: auth });
  console.log(
    "GET history:",
    history.status,
    `count=${history.data.history?.length || 0}`,
    history.data.history?.[0]
      ? `latest edited_by=${history.data.history[0].edited_by}`
      : "",
  );

  const historyId = history.data.history?.[0]?.id;
  if (!historyId) {
    console.error("No history entry created");
    process.exit(1);
  }

  const restore = await request(`/content-blocks/${SECTION}/restore/${historyId}`, {
    method: "POST",
    headers: auth,
  });
  console.log("POST restore:", restore.status, restore.data.success ? "ok" : restore.data);

  const afterRestore = await request(`/content-blocks/${SECTION}`);
  console.log(
    "After restore kicker:",
    afterRestore.data.block?.fields?.kicker,
    afterRestore.data.block?.fields?.kicker === testKicker ? "(test value)" : "(reverted)",
  );

  const reset = await request(`/content-blocks/${SECTION}/reset-to-default`, {
    method: "POST",
    headers: auth,
  });
  console.log("POST reset-to-default:", reset.status, reset.data.success ? "ok" : reset.data);

  const afterReset = await request(`/content-blocks/${SECTION}`);
  console.log("After reset kicker:", afterReset.data.block?.fields?.kicker);

  const history2 = await request(`/content-blocks/${SECTION}/history`, { headers: auth });
  console.log("History count after restore+reset:", history2.data.history?.length || 0);

  console.log("Done — history endpoints working.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
