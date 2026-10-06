/**
 * Read-only: warns when the chatbot's static discipline list
 * (src/data/chatbotKnowledge.js) drifts from the disciplines table.
 *
 * Checks: missing slugs on either side, active flag vs is_active,
 * budget_range and timeline. Exits 1 when anything differs.
 *
 * Usage: node scripts/check-chatbot-disciplines.js
 */
require("dotenv").config({ quiet: true });
const pool = require("../src/config/db");
const { DISCIPLINES } = require("../src/data/chatbotKnowledge");

(async () => {
  const { rows } = await pool.query(
    "SELECT slug, title, is_active, budget_range, timeline FROM disciplines WHERE slug IS NOT NULL AND slug <> ''",
  );
  const db = new Map(rows.map((r) => [r.slug.trim(), r]));
  const warnings = [];

  for (const d of DISCIPLINES) {
    const row = db.get(d.slug);
    const botActive = d.active !== false;
    if (!row) {
      warnings.push(`${d.slug}: in chatbot knowledge but not in the disciplines table`);
      continue;
    }
    if (row.is_active !== botActive) {
      warnings.push(
        `${d.slug}: DB is_active=${row.is_active} but chatbot active=${botActive}` +
          (row.is_active ? " (remove `active: false`)" : " (add `active: false`)"),
      );
    }
    if (row.budget_range !== d.budget_range) {
      warnings.push(`${d.slug}: budget_range DB="${row.budget_range}" chatbot="${d.budget_range}"`);
    }
    if (row.timeline !== d.timeline) {
      warnings.push(`${d.slug}: timeline DB="${row.timeline}" chatbot="${d.timeline}"`);
    }
  }

  // Inactive DB rows the bot doesn't know about are harmless — it wouldn't list them anyway.
  for (const [slug, row] of db) {
    if (row.is_active && !DISCIPLINES.some((d) => d.slug === slug)) {
      warnings.push(`${slug}: in the disciplines table (is_active=${row.is_active}) but not in chatbot knowledge`);
    }
  }

  if (warnings.length) {
    console.warn(`WARNING: chatbot knowledge differs from the DB (${warnings.length}):`);
    warnings.forEach((w) => console.warn("  - " + w));
    console.warn("Update src/data/chatbotKnowledge.js, then run scripts/emit-chatbot-browser.js.");
    process.exitCode = 1;
  } else {
    console.log(`OK: ${DISCIPLINES.length} chatbot disciplines match the DB (active flags, budgets, timelines).`);
  }
  await pool.end();
})().catch(async (e) => {
  console.error("FAILED:", e.message || e);
  try {
    await pool.end();
  } catch (_) {}
  process.exit(1);
});
