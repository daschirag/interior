/**
 * One-time backfill: resolve city -> district + region for existing enquiries.
 * Usage: node database/backfill-regions.js
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

  let updated = 0;
  let skipped = 0;
  let unresolved = 0;

  for (const row of rows) {
    const needsBackfill =
      !row.region ||
      row.region === "Unknown" ||
      row.region === "unknown" ||
      !row.district;

    if (!needsBackfill) {
      skipped++;
      continue;
    }

    const resolved = resolveRegion(row.city);

    if (resolved.region === "Unknown") {
      unresolved++;
      console.log(`UNRESOLVED id=${row.id} city="${row.city || ""}"`);
      continue;
    }

    await pool.query(
      `
      UPDATE contact_submissions
      SET city = $1, district = $2, region = $3
      WHERE id = $4
      `,
      [resolved.city, resolved.district, resolved.region, row.id],
    );

    updated++;
    console.log(
      `UPDATED id=${row.id} "${row.city}" -> ${resolved.city} / ${resolved.district} / ${resolved.region}`,
    );
  }

  console.log("\n=== Backfill complete ===");
  console.log(`Total rows:     ${rows.length}`);
  console.log(`Updated:        ${updated}`);
  console.log(`Skipped (ok):   ${skipped}`);
  console.log(`Still unknown:  ${unresolved}`);

  await pool.end();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
