/**
 * Tests media-library "in use" lookup against real DB + ImageKit files.
 * Run: node database/test-media-library-usage.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../src/config/db");
const { getImageKit } = require("../src/config/imagekit");
const {
  normalizeImageUrl,
  buildImageReferenceIndex,
  lookupImageUsages,
} = require("../src/services/imageReferenceIndex");

async function listSampleFiles(imagekit, limit = 5) {
  const batch = await imagekit.listFiles({ path: "/interior-cms", limit });
  return (batch || []).filter((f) => f.type === "file");
}

async function main() {
  const imagekit = getImageKit();
  if (!imagekit) {
    console.error("ImageKit not configured");
    process.exit(1);
  }

  console.log("=== Media library usage lookup test ===\n");

  const files = await listSampleFiles(imagekit, 5);
  console.log(`ImageKit sample files (${files.length}):`);
  for (const file of files) {
    console.log(`  - ${file.name} (${file.fileId})`);
    console.log(`    url: ${file.url}`);
  }

  let index = await buildImageReferenceIndex();
  console.log("\n--- Current DB references (no ImageKit URLs expected) ---");
  for (const file of files.slice(0, 3)) {
    const usages = lookupImageUsages(index, {
      url: file.url,
      filePath: file.filePath,
      name: file.name,
    });
    console.log(`${file.name}: ${usages.length} usage(s)`);
  }

  console.log("\n--- Local asset reference (dashboard-hero) ---");
  const hero = await pool.query(
    `SELECT section_key, section_label, images FROM content_blocks WHERE section_key = 'dashboard-hero'`,
  );
  const heroUrl = hero.rows[0]?.images?.[0]?.url;
  console.log("Stored hero URL:", heroUrl);
  const heroUsages = lookupImageUsages(index, { url: heroUrl });
  console.log(
    "Lookup result:",
    heroUsages.length
      ? heroUsages.map((u) => `${u.label} (${u.field})`).join(", ")
      : "NOT FOUND (unexpected)",
  );

  if (!files.length) {
    console.log("\nNo ImageKit files to run live reference test.");
    process.exit(0);
  }

  const testFile = files[0];
  const discipline = await pool.query(
    `SELECT id, title, image_url FROM disciplines WHERE is_active = true ORDER BY id ASC LIMIT 1`,
  );
  const row = discipline.rows[0];
  const originalUrl = row.image_url;

  console.log("\n--- Live reference test (temporary DB update, then revert) ---");
  console.log(`Assigning ImageKit file to discipline "${row.title}" (id ${row.id})`);
  console.log(`Test URL: ${testFile.url}`);

  await pool.query(`UPDATE disciplines SET image_url = $1 WHERE id = $2`, [
    testFile.url,
    row.id,
  ]);

  index = await buildImageReferenceIndex();
  const liveUsages = lookupImageUsages(index, {
    url: testFile.url,
    filePath: testFile.filePath,
    name: testFile.name,
  });

  console.log("Usages found:", JSON.stringify(liveUsages, null, 2));

  const urlWithoutQuery = testFile.url.split("?")[0];
  const pathOnlyUsages = lookupImageUsages(index, { url: urlWithoutQuery });
  console.log(
    "Match without query string:",
    pathOnlyUsages.length ? "PASS" : "FAIL",
  );

  await pool.query(`UPDATE disciplines SET image_url = $1 WHERE id = $2`, [
    originalUrl,
    row.id,
  ]);
  console.log("Reverted discipline image_url.");

  const pass =
    liveUsages.length === 1 &&
    liveUsages[0].type === "discipline" &&
    String(liveUsages[0].id) === String(row.id) &&
    pathOnlyUsages.length === 1;

  console.log(`\nOverall: ${pass ? "PASS" : "FAIL"}`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
