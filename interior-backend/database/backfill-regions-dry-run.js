/**
 * Dry-run backfill — logs what WOULD change; does not write to the database.
 * Usage: node database/backfill-regions-dry-run.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../src/config/db");
const { resolveRegion } = require("../src/utils/karnatakaRegions");

async function main() {
  const { rows } = await pool.query(`
    SELECT id, city, district, region
    FROM contact_submissions
    ORDER BY id ASC
  `);

  let wouldUpdate = 0;
  let wouldSkip = 0;
  let wouldStayUnresolved = 0;

  const updateLines = [];
  const unresolvedLines = [];
  const skipLines = [];

  for (const row of rows) {
    const needsBackfill =
      !row.region ||
      row.region === "Unknown" ||
      row.region === "unknown" ||
      !row.district;

    if (!needsBackfill) {
      wouldSkip++;
      skipLines.push(
        `SKIP id=${row.id} city="${row.city || ""}" district="${row.district}" region="${row.region}"`,
      );
      continue;
    }

    const resolved = resolveRegion(row.city);

    if (resolved.region === "Unknown") {
      wouldStayUnresolved++;
      unresolvedLines.push(
        `UNRESOLVED id=${row.id} city="${row.city || ""}" (stored district="${row.district || ""}" region="${row.region || ""}")`,
      );
      continue;
    }

    wouldUpdate++;
    updateLines.push(
      `WOULD UPDATE id=${row.id} "${row.city || ""}" -> city="${resolved.city}" district="${resolved.district}" region="${resolved.region}"`,
    );
  }

  console.log("\n=== DRY RUN — no database writes ===\n");

  if (updateLines.length) {
    console.log("--- Would update ---");
    updateLines.forEach((line) => console.log(line));
  }

  if (unresolvedLines.length) {
    console.log("\n--- Would stay unresolved ---");
    unresolvedLines.forEach((line) => console.log(line));
  }

  if (skipLines.length) {
    console.log("\n--- Would skip (already ok) ---");
    skipLines.forEach((line) => console.log(line));
  }

  console.log("\n=== Summary ===");
  console.log(`Total rows:              ${rows.length}`);
  console.log(`Would update:            ${wouldUpdate}`);
  console.log(`Would skip (already ok): ${wouldSkip}`);
  console.log(`Would stay unresolved:   ${wouldStayUnresolved}`);
  console.log("\n(No rows were modified.)\n");

  await pool.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
