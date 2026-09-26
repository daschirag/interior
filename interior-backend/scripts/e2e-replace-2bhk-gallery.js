require("dotenv").config();
const fs = require("fs");
const path = require("path");
const ImageKit = require("imagekit");
const pool = require("../src/config/db");
const Discipline = require("../src/models/disciplineModel");
const EntityHistory = require("../src/models/entityHistoryModel");
const { disciplineToSnapshot } = require("../src/utils/entitySnapshot");
const {
  buildImageReferenceIndex,
  lookupImageUsages,
} = require("../src/services/imageReferenceIndex");

const SLUG = "2-bhk-interiors";
const PREFIX = "2bhk";

// First file is cover image
const SOURCE_FILES = [
  "C:\\Users\\HP\\Downloads\\WhatsApp Image 2026-08-05 at 13.07.04 (1).jpeg",
  "C:\\Users\\HP\\Downloads\\WhatsApp Image 2026-08-05 at 13.07.06.jpeg",
  "C:\\Users\\HP\\Downloads\\WhatsApp Image 2026-08-05 at 13.10.32.jpeg",
];

const ik = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function urlToFilename(url) {
  try {
    return path.basename(new URL(url).pathname);
  } catch {
    return path.basename(url);
  }
}

async function findImageKitFileId(url) {
  const name = urlToFilename(url);
  try {
    const results = await ik.listFiles({
      searchQuery: `name = "${name}"`,
      limit: 5,
    });
    if (results && results.length > 0) return results[0].fileId;
  } catch (e) {
    console.warn("  listFiles error for", name, ":", e.message);
  }
  return null;
}

(async () => {
  await Discipline.createTable();
  await EntityHistory.createTable();

  // ── Step 1: Read current images ───────────────────────────────────────────
  console.log("=== Step 1: Current images for", SLUG, "===");

  const { rows } = await pool.query(
    "SELECT id, image_url, images FROM disciplines WHERE slug = $1 AND is_active = true",
    [SLUG]
  );
  if (!rows.length) throw new Error(SLUG + " not found in disciplines table");

  const dbRow = rows[0];
  const oldImages = Array.isArray(dbRow.images)
    ? dbRow.images.filter(Boolean)
    : dbRow.image_url
    ? [dbRow.image_url]
    : [];
  const oldCover = dbRow.image_url;

  console.log("Old cover  :", oldCover);
  console.log("Old images (" + oldImages.length + "):");
  oldImages.forEach((u, i) => console.log(`  [${i}] ${u}`));

  // ── Step 2: Upload 3 new files ────────────────────────────────────────────
  console.log("\n=== Step 2: Upload 3 new files to ImageKit ===");

  for (const f of SOURCE_FILES) {
    if (!fs.existsSync(f)) throw new Error("Source file not found: " + f);
  }

  const newUrls = [];
  for (const filePath of SOURCE_FILES) {
    const basename = path.basename(filePath);
    const safeName =
      PREFIX + "-" + Date.now() + "-" + basename.replace(/[^A-Za-z0-9._-]+/g, "_");
    process.stdout.write("   " + basename + " … ");
    const res = await ik.upload({
      file: fs.readFileSync(filePath),
      fileName: safeName,
      folder: "/interior-cms",
    });
    console.log("OK →", res.url);
    newUrls.push(res.url);
  }

  // ── Step 3: Update disciplines table ─────────────────────────────────────
  console.log("\n=== Step 3: Update disciplines table ===");

  const existing = await Discipline.findById(dbRow.id);
  await EntityHistory.insertSnapshot({
    entityType: "discipline",
    entityId: dbRow.id,
    snapshot: disciplineToSnapshot(existing),
    editedBy: "e2e-replace-2bhk-gallery",
  });

  const updated = await Discipline.update(dbRow.id, {
    ...existing,
    images: newUrls,
    image_url: newUrls[0],
  });

  console.log("Updated images (" + updated.images.length + "):");
  updated.images.forEach((u, i) => console.log(`  [${i}] ${u}`));
  console.log("Updated cover :", updated.image_url);
  console.log("Cover synced  :", updated.image_url === updated.images[0]);

  // ── Step 4: Orphan check ──────────────────────────────────────────────────
  console.log("\n=== Step 4: Orphan check for old images ===");

  // Re-query the reference index AFTER the update so old URLs are gone
  const refIndex = await buildImageReferenceIndex();

  const toDelete = [];
  const retained = [];
  const skippedNonImageKit = [];

  for (const url of oldImages) {
    const isImageKitUrl = /ik\.imagekit\.io/i.test(url);
    if (!isImageKitUrl) {
      skippedNonImageKit.push(url);
      continue;
    }
    const usages = lookupImageUsages(refIndex, { url });
    if (usages.length === 0) {
      toDelete.push(url);
    } else {
      retained.push({ url, usages });
    }
  }

  if (skippedNonImageKit.length > 0) {
    console.log("Skipped (not ImageKit-hosted, nothing to delete):");
    skippedNonImageKit.forEach((u) => console.log("  ", u));
  }

  if (toDelete.length === 0) {
    console.log("No orphaned ImageKit images — nothing to delete.");
  } else {
    console.log("Deleting", toDelete.length, "orphaned image(s) from ImageKit…");
    for (const url of toDelete) {
      const fileId = await findImageKitFileId(url);
      if (fileId) {
        await ik.deleteFile(fileId);
        console.log("  Deleted :", url);
      } else {
        console.log("  WARNING : fileId not found for", url, "— skipped");
      }
    }
  }

  if (retained.length > 0) {
    console.log("Retained (still referenced elsewhere):");
    for (const { url, usages } of retained) {
      console.log("  URL:", url);
      usages.forEach((u) =>
        console.log(
          `    → ${u.type}#${u.id} field=${u.field} label="${u.label}"`
        )
      );
    }
  }

  // ── Step 5: Before / after summary ───────────────────────────────────────
  console.log("\n=== Step 5: Summary ===");
  console.log("BEFORE:");
  console.log("  cover :", oldCover);
  oldImages.forEach((u, i) => console.log(`  images[${i}]: ${u}`));
  console.log("AFTER:");
  console.log("  cover :", updated.image_url);
  updated.images.forEach((u, i) => console.log(`  images[${i}]: ${u}`));
  console.log("Orphans deleted :", toDelete.length);
  console.log("Retained (still used) :", retained.length);
  console.log("Skipped (non-ImageKit) :", skippedNonImageKit.length);

  await pool.end();
})().catch(async (e) => {
  console.error("FAILED:", e.message || e);
  try {
    await pool.end();
  } catch (_) {}
  process.exit(1);
});
