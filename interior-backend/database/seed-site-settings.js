/**
 * Seeds the single site_settings row from public/Contact.html's static
 * fallback markup (the "direct contact" strip and footer — exact hardcoded
 * values). site_settings has never had a row in production; every other
 * consumer (cms-hydrate.js, the admin form) already null-checks for that,
 * but nothing was ever pushed through PUT /api/site-settings to populate it.
 *
 * Run: node database/seed-site-settings.js
 * Preview without writing: node database/seed-site-settings.js --dry-run
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");
const SiteSettings = require("../src/models/siteSettingsModel");

const CONTACT_HTML = path.join(__dirname, "..", "..", "public", "Contact.html");

function match(html, regex) {
  const m = html.match(regex);
  return m ? m[1].trim() : null;
}

function parseSiteSettingsFromContactHtml(html) {
  // "Direct contact" strip: <section class="direct" ...>
  const directBlockMatch = html.match(/<section class="direct"[\s\S]*?<\/section>/);
  if (!directBlockMatch) {
    throw new Error('Could not find <section class="direct"> in Contact.html');
  }
  const directBlock = directBlockMatch[0];

  const email = match(
    directBlock,
    /data-cms-field="email"[^>]*>([^<]+)</,
  );
  // NOTE: data-cms-field="phone" in Contact.html's "direct contact" strip is
  // "+91 80 4000 0000" — a known placeholder/fake number, deliberately
  // excluded from the Organization schema elsewhere in this project. It is
  // never seeded here; see the `phone` override below.
  const businessHours = match(
    directBlock,
    /data-cms-field="hours"[^>]*>([^<]+)</,
  );

  // Footer social row
  const youtubeUrl = match(html, /href="([^"]+)"\s+class="foot-soc foot-soc-yt"/);
  const facebookUrl = match(html, /href="([^"]+)"\s+class="foot-soc foot-soc-fb"/);
  const instagramUrl = match(html, /href="([^"]+)"\s+class="foot-soc foot-soc-ig"/);

  // WhatsApp deep link (follow-card--wa), trimmed to just the number
  const whatsappHref = match(
    html,
    /follow-card--wa"\s+href="(https:\/\/wa\.me\/[^"?]+)/,
  );
  const whatsapp = whatsappHref ? "+" + whatsappHref.replace(/^https:\/\/wa\.me\//, "") : null;

  // ISO certificate link — this is what cms-hydrate.js actually wires
  // settings.catalog_pdf_url to (`.foot-iso`), despite the field name; not a
  // link to the material catalogs (flexibond-laminate-catalog.pdf etc).
  const catalogPdfUrl = match(
    html,
    /<a href="([^"]+)"[^>]*class="foot-iso"/,
  );

  // Footer copyright line: "© MMXXVI Vinayak Aluminium Interiors"
  const companyName = match(
    html,
    /footer\.copyright">©\s*[MDCLXVI]+\s+([^<]+)</,
  );

  return {
    company_name: companyName,
    // The general contact number: same real Dharwad studio line already
    // used site-wide as the WhatsApp/general contact number (not the
    // "+91 80 4000 0000" placeholder in the direct-contact strip markup).
    phone: whatsapp,
    email,
    // No single HQ address exists in the fallback markup — only per-studio
    // addresses, which already live in the separate `studios` table (seeded
    // by seed-studios.js). Left null rather than guessed.
    address: null,
    whatsapp,
    instagram_url: instagramUrl,
    facebook_url: facebookUrl,
    youtube_url: youtubeUrl,
    business_hours: businessHours,
    catalog_pdf_url: catalogPdfUrl,
    // Only used as a fallback if GET /api/studios fails at runtime; the
    // `studios` table is the primary source and is already seeded, so this
    // is left empty rather than duplicated here.
    studio_locations: [],
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const html = fs.readFileSync(CONTACT_HTML, "utf8");
  const settings = parseSiteSettingsFromContactHtml(html);

  const required = ["company_name", "phone", "email", "business_hours"];
  const missing = required.filter((key) => !settings[key]);
  if (missing.length) {
    console.error("Failed to parse required field(s) from Contact.html:", missing.join(", "));
    process.exit(1);
  }

  console.log("Parsed site_settings from Contact.html:");
  console.log(JSON.stringify(settings, null, 2));

  if (dryRun) {
    console.log("\n--dry-run: not writing to the database.");
    process.exit(0);
  }

  await SiteSettings.createTable();
  const saved = await SiteSettings.upsert(settings);
  console.log("\nSeeded site_settings row, id:", saved.id);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
