/**
 * Adds projects.is_future (BOOLEAN NOT NULL DEFAULT false) — drives the "Future project" label.
 * Idempotent: safe to run more than once. Existing code that doesn't know the column ignores it.
 *
 * No grant/policy change is needed: anon has a table-level SELECT grant and a `USING (true)` read
 * policy, and the supabase_realtime publication includes projects without a column list, so the
 * new column reaches the REST API and Realtime automatically (verified 2026-10-10).
 *
 * Usage: node database/migrate-add-projects-is-future.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

async function migrate(client = pool) {
  await client.query("ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_future BOOLEAN NOT NULL DEFAULT false");
}

module.exports = { migrate };

if (require.main === module) {
  migrate()
    .then(() => console.log("projects.is_future: present"))
    .catch((e) => { console.error("Migration failed:", e.message); process.exitCode = 1; })
    .finally(() => pool.end());
}
