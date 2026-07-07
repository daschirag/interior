/**
 * Seeds studios from public/Contact.html .loc cards (exact hardcoded values).
 * Run: node database/seed-studios.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");
const Studio = require("../src/models/studioModel");

const CONTACT_HTML = path.join(__dirname, "..", "..", "public", "Contact.html");

function decodeHtml(text) {
  return String(text || "")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&#8377;/g, "₹")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseStudiosFromContactHtml(html) {
  const studios = [];
  const blocks = html.match(/<article class="loc"[\s\S]*?<\/article>/g) || [];

  blocks.forEach((block, index) => {
    const city = decodeHtml(
      (block.match(/<h3 class="loc-city">([\s\S]*?)<\/h3>/) || [])[1],
    );
    const brand = decodeHtml(
      (block.match(/<p class="loc-brand">([\s\S]*?)<\/p>/) || [])[1],
    );
    const address = decodeHtml(
      (block.match(/<p class="loc-addr">([\s\S]*?)<\/p>/) || [])[1],
    );
    const hours = decodeHtml(
      (block.match(
        /<span class="lm-k">Hours<\/span><span class="lm-v">([\s\S]*?)<\/span>/,
      ) || [])[1],
    );
    const mapsUrl = (block.match(/loc-btn--maps" href="([^"]+)"/) || [])[1] || null;
    const phone = (block.match(/loc-btn--call" href="tel:([^"]+)"/) || [])[1] || null;
    const phoneDisplay = decodeHtml(
      (block.match(
        /loc-btn--call[\s\S]*?<span class="loc-btn-label">([\s\S]*?)<\/span>/,
      ) || [])[1],
    ).replace(/^Call\s+/i, "");

    studios.push({
      city,
      brand,
      address,
      hours,
      maps_url: mapsUrl,
      phone,
      phone_display: phoneDisplay,
      image_url: null,
      display_order: index + 1,
    });
  });

  return studios;
}

async function main() {
  const html = fs.readFileSync(CONTACT_HTML, "utf8");
  const studios = parseStudiosFromContactHtml(html);

  if (studios.length !== 4) {
    console.error("Expected 4 studios from Contact.html, got", studios.length);
    process.exit(1);
  }

  await Studio.createTable();

  for (const studio of studios) {
    const saved = await Studio.upsertByCity(studio);
    console.log("Seeded studio:", saved.city);
  }

  const count = await pool.query("SELECT COUNT(*)::int AS n FROM studios WHERE is_active = true");
  console.log("Done — studios count:", count.rows[0].n);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
