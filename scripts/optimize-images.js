/**
 * Compress public/assets/images to match ImageKit-style budgets:
 *   hero / full-bleed: max 1920w, q75
 *   mobile variants:   max 900w, q75
 *   card / thumbnail:  max 600w, q75
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const DIR = path.join(__dirname, "..", "public", "assets", "images");
const REPORT = path.join(__dirname, "image-optimize-report.json");

const CARD = new Set([
  "img-featured-penthouse.jpg",
  "img-featured-basalt.jpg",
  "img-featured-linen-oak.jpg",
  "img-svc-1bhk.jpg",
  "img-svc-2bhk.jpg",
  "img-svc-3bhk.jpg",
  "img-svc-4bhk.jpg",
  "img-svc-aluminium.jpg",
  "img-living.jpg",
  "img-kitchen.jpg",
]);

function presetFor(name) {
  if (/-mobile\.jpg$/i.test(name)) return { key: "mobile", width: 900, quality: 75 };
  if (CARD.has(name)) return { key: "card", width: 600, quality: 75 };
  return { key: "hero", width: 1920, quality: 75 };
}

async function optimizeFile(file) {
  const name = path.basename(file);
  const preset = presetFor(name);
  const before = fs.statSync(file).size;
  const tmp = file + ".opt.tmp";

  await sharp(file)
    .rotate()
    .resize({
      width: preset.width,
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: preset.quality, progressive: true, mozjpeg: true })
    .toFile(tmp);

  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, file);
  } else {
    fs.unlinkSync(tmp);
  }

  const finalSize = fs.statSync(file).size;
  return {
    file: name,
    preset: preset.key,
    width: preset.width,
    beforeBytes: before,
    afterBytes: finalSize,
    savedBytes: before - finalSize,
    savedPct: before ? Math.round(((before - finalSize) / before) * 1000) / 10 : 0,
  };
}

async function main() {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => /\.jpe?g$/i.test(f))
    .map((f) => path.join(DIR, f));

  const results = [];
  for (const file of files) {
    process.stdout.write("Optimizing " + path.basename(file) + "… ");
    const row = await optimizeFile(file);
    results.push(row);
    console.log(
      (row.beforeBytes / 1e6).toFixed(2) +
        " MB → " +
        (row.afterBytes / 1e6).toFixed(2) +
        " MB (" +
        row.savedPct +
        "% · " +
        row.preset +
        ")"
    );
  }

  const beforeTotal = results.reduce((s, r) => s + r.beforeBytes, 0);
  const afterTotal = results.reduce((s, r) => s + r.afterBytes, 0);
  const summary = {
    generatedAt: new Date().toISOString(),
    beforeTotalBytes: beforeTotal,
    afterTotalBytes: afterTotal,
    savedBytes: beforeTotal - afterTotal,
    savedPct: Math.round(((beforeTotal - afterTotal) / beforeTotal) * 1000) / 10,
    results,
  };
  fs.writeFileSync(REPORT, JSON.stringify(summary, null, 2));
  console.log(
    "\nTotal: " +
      (beforeTotal / 1e6).toFixed(1) +
      " MB → " +
      (afterTotal / 1e6).toFixed(1) +
      " MB (−" +
      summary.savedPct +
      "%)"
  );
  console.log("Report: " + REPORT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
