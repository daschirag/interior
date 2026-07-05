/**
 * Seeds disciplines from public/Services.html #svcList (data-svc 0–12).
 * Run: node database/seed-disciplines.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");
const Discipline = require("../src/models/disciplineModel");

const SERVICES_HTML = path.join(__dirname, "..", "..", "public", "Services.html");

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

function slugify(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractHeadlineHtml(expandBlock) {
  const raw =
    (expandBlock.match(/<h3 class="svc-expand-title">([\s\S]*?)<\/h3>/) || [])[1] ||
    "";
  return raw
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .trim();
}

function extractExpandBlock(html, index) {
  const startTag = `<div class="svc-expand" data-for="${index}">`;
  const start = html.indexOf(startTag);
  if (start === -1) return null;

  let pos = start + startTag.length;
  let depth = 1;

  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", pos);
    const nextClose = html.indexOf("</div>", pos);
    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 4;
    } else {
      depth -= 1;
      pos = nextClose + 6;
    }
  }

  return html.slice(start + startTag.length, pos - 6);
}

function parseDisciplinesFromServicesHtml(html) {
  const disciplines = [];

  for (let i = 0; i <= 12; i++) {
    const rowMatch = html.match(
      new RegExp(`<div class="svc-row" data-svc="${i}"[\\s\\S]*?<\\/div>`),
    );
    const expandBlock = extractExpandBlock(html, i);

    if (!rowMatch || !expandBlock) {
      throw new Error(`Could not parse discipline data-svc="${i}" from Services.html`);
    }

    const rowBlock = rowMatch[0];

    const title = decodeHtml(
      (rowBlock.match(/<span class="svc-name">([\s\S]*?)<\/span>/) || [])[1],
    );
    const subtitle = decodeHtml(
      (rowBlock.match(/<span class="svc-meta">([\s\S]*?)<\/span>/) || [])[1],
    );
    const headline = extractHeadlineHtml(expandBlock);
    const imageUrl =
      (expandBlock.match(/data-lazy-bg="([^"]+)"/) || [])[1] || null;
    const description = decodeHtml(
      (expandBlock.match(/<p class="svc-expand-desc">([\s\S]*?)<\/p>/) || [])[1],
    );

    function pickSpec(block, label) {
      const re = new RegExp(
        `<div class="svc-spec"><div class="ss-k">${label}</div><div class="ss-v">([\\s\\S]*?)</div></div>`,
      );
      return decodeHtml((block.match(re) || [])[1]);
    }

    const budgetRange = pickSpec(expandBlock, "Budget Range");
    const timeline = pickSpec(expandBlock, "Timeline");
    const scopeSpec = pickSpec(expandBlock, "Scope");

    const featuresBlock =
      (expandBlock.match(/<div class="svc-expand-features">([\s\S]*?)<\/div>/) ||
        [])[1] || "";
    const featureTags = (featuresBlock.match(/<span>([\s\S]*?)<\/span>/g) || [])
      .map((span) => decodeHtml(span.replace(/<\/?span>/g, "")))
      .filter(Boolean);

    disciplines.push({
      slug: slugify(title),
      title,
      display_order: i + 1,
      subtitle: subtitle || null,
      headline: headline || null,
      description: description || null,
      budget_range: budgetRange || null,
      timeline: timeline || null,
      scope: scopeSpec || null,
      tags: featureTags,
      image_url: imageUrl,
      cta_projects_link: "Projects.html",
      cta_consult_link: "Contact.html",
    });
  }

  return disciplines;
}

async function main() {
  await pool.query("DELETE FROM disciplines WHERE title = $1", [
    "Step2 Test Discipline",
  ]);

  const html = fs.readFileSync(SERVICES_HTML, "utf8");
  const disciplines = parseDisciplinesFromServicesHtml(html);

  if (disciplines.length !== 13) {
    console.error("Expected 13 disciplines from Services.html, got", disciplines.length);
    process.exit(1);
  }

  await Discipline.createTable();

  for (const discipline of disciplines) {
    const saved = await Discipline.upsertBySlug(discipline);
    console.log("Seeded discipline:", saved.title);
  }

  const count = await pool.query(
    "SELECT COUNT(*)::int AS n FROM disciplines WHERE is_active = true",
  );
  console.log("Done — disciplines count:", count.rows[0].n);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
