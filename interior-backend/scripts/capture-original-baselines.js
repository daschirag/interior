/**
 * Refresh "Reset to original" baselines from a live API dump (or cached scripts/.tmp).
 * Includes fields_kn/hi and discipline/project *_kn/*_hi so Reset no longer wipes i18n.
 *
 * Usage:
 *   node interior-backend/scripts/capture-original-baselines.js
 *   node interior-backend/scripts/capture-original-baselines.js --from-cache
 */
const fs = require("fs");
const path = require("path");

const API_BASE =
  process.env.VINAYAK_API || "https://vinayak-interiors-api.onrender.com/api";
const OUT_DIR = path.join(__dirname, "..", "src", "data", "original-baselines");
const CACHE_DIR = path.join(__dirname, "..", "..", "scripts", ".tmp");
const fromCache = process.argv.includes("--from-cache");

function fixCityCopy(value) {
  if (value == null) return value;
  if (typeof value !== "string") return value;
  let t = value;
  t = t.replace(/Four cities/g, "Five cities");
  t = t.replace(/ನಾಲ್ಕು ನಗರಗಳು/g, "ಐದು ನಗರಗಳು");
  t = t.replace(/चार शहर/g, "पाँच शहर");
  t = t.replace(
    /across Vijayapura, Dharwad, Kalaburagi & Hospet/g,
    "across Bengaluru, Vijayapura, Dharwad, Kalaburagi & Hospet",
  );
  t = t.replace(
    /ವಿಜಯಪುರ, ಧಾರವಾಡ, ಕಲಬುರಗಿ ಮತ್ತು ಹೊಸಪೇಟೆ/g,
    "ಬೆಂಗಳೂರು, ವಿಜಯಪುರ, ಧಾರವಾಡ, ಕಲಬುರಗಿ ಮತ್ತು ಹೊಸಪೇಟೆ",
  );
  t = t.replace(
    /विजयपुरा, धारवाड़, कलबुर्गी और होसपेट/g,
    "बेंगलुरु, विजयपुरा, धारवाड़, कलबुर्गी और होसपेट",
  );
  t = t.replace(
    /studios in Vijayapura, Dharwad, Kalaburagi, and Hospet/g,
    "studios in Bengaluru, Vijayapura, Dharwad, Kalaburagi, and Hospet",
  );
  return t;
}

function fixFields(fields) {
  if (!fields || typeof fields !== "object") return fields || {};
  const next = { ...fields };
  Object.keys(next).forEach((k) => {
    if (typeof next[k] === "string") next[k] = fixCityCopy(next[k]);
  });
  if (next.stat_cities_value === "04" || next.stat_cities_value === "4") {
    next.stat_cities_value = "05";
  }
  if (
    typeof next.h2_html === "string" &&
    /Five cities/i.test(next.h2_html) === false &&
    /cities/i.test(next.h2_html)
  ) {
    next.h2_html = fixCityCopy(next.h2_html);
  }
  return next;
}

function blockBaseline(b) {
  return {
    page: b.page,
    section_key: b.section_key,
    section_label: b.section_label,
    fields: fixFields(b.fields || {}),
    fields_kn: fixFields(b.fields_kn || {}),
    fields_hi: fixFields(b.fields_hi || {}),
    images: b.images || [],
  };
}

function projectBaseline(p) {
  return {
    title: p.title,
    slug: p.slug,
    location: p.location ?? null,
    year: p.year ?? null,
    area_sqft: p.area_sqft ?? null,
    project_type: p.project_type ?? null,
    description: p.description ?? null,
    material_tags: Array.isArray(p.material_tags) ? [...p.material_tags] : [],
    images: Array.isArray(p.images) ? [...p.images] : [],
    before_image_url: p.before_image_url ?? null,
    after_image_url: p.after_image_url ?? null,
    is_featured: p.is_featured ?? false,
    journey_order: p.journey_order ?? 0,
    is_active: p.is_active !== false,
    title_kn: p.title_kn ?? null,
    description_kn: p.description_kn ?? null,
    title_hi: p.title_hi ?? null,
    description_hi: p.description_hi ?? null,
  };
}

function disciplineBaseline(d) {
  return {
    slug: d.slug,
    title: d.title,
    display_order: d.display_order ?? 0,
    subtitle: d.subtitle ?? null,
    headline: d.headline ?? null,
    description: d.description ?? null,
    budget_range: d.budget_range ?? null,
    timeline: d.timeline ?? null,
    scope: d.scope ?? null,
    tags: Array.isArray(d.tags) ? [...d.tags] : [],
    image_url: d.image_url ?? null,
    images: Array.isArray(d.images)
      ? [...d.images]
      : d.image_url
        ? [d.image_url]
        : [],
    cta_projects_link: d.cta_projects_link ?? null,
    cta_consult_link: d.cta_consult_link ?? null,
    is_active: d.is_active !== false,
    title_kn: d.title_kn ?? null,
    scope_kn: d.scope_kn ?? null,
    subtitle_kn: d.subtitle_kn ?? null,
    headline_kn: d.headline_kn ?? null,
    description_kn: d.description_kn ?? null,
    tags_kn: Array.isArray(d.tags_kn) ? [...d.tags_kn] : [],
    title_hi: d.title_hi ?? null,
    scope_hi: d.scope_hi ?? null,
    subtitle_hi: d.subtitle_hi ?? null,
    headline_hi: d.headline_hi ?? null,
    description_hi: d.description_hi ?? null,
    tags_hi: Array.isArray(d.tags_hi) ? [...d.tags_hi] : [],
  };
}

async function fetchJson(pathname) {
  const res = await fetch(`${API_BASE}${pathname}`);
  if (!res.ok) throw new Error(`GET ${pathname} failed: ${res.status}`);
  return res.json();
}

async function loadSource() {
  if (fromCache) {
    return {
      blocks: JSON.parse(
        fs.readFileSync(path.join(CACHE_DIR, "live-content-blocks.json"), "utf8"),
      ).blocks,
      projects: JSON.parse(
        fs.readFileSync(path.join(CACHE_DIR, "live-projects.json"), "utf8"),
      ).projects,
      disciplines: JSON.parse(
        fs.readFileSync(path.join(CACHE_DIR, "live-disciplines.json"), "utf8"),
      ).disciplines,
      source: "scripts/.tmp cache",
    };
  }
  try {
    const [blocksJson, projectsJson, discsJson] = await Promise.all([
      fetchJson("/content-blocks"),
      fetchJson("/projects"),
      fetchJson("/disciplines"),
    ]);
    return {
      blocks: blocksJson.blocks,
      projects: projectsJson.projects,
      disciplines: discsJson.disciplines,
      source: API_BASE,
    };
  } catch (err) {
    console.warn("Live API unavailable, falling back to cache:", err.message);
    return loadSourceFallback();
  }
}

function loadSourceFallback() {
  return {
    blocks: JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, "live-content-blocks.json"), "utf8"),
    ).blocks,
    projects: JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, "live-projects.json"), "utf8"),
    ).projects,
    disciplines: JSON.parse(
      fs.readFileSync(path.join(CACHE_DIR, "live-disciplines.json"), "utf8"),
    ).disciplines,
    source: "scripts/.tmp cache (API fallback)",
  };
}

async function main() {
  const src = fromCache ? await loadSource() : await loadSource();
  const blocks = (src.blocks || []).map(blockBaseline);
  const projects = (src.projects || []).map(projectBaseline);
  const disciplines = (src.disciplines || []).map(disciplineBaseline);

  // Force contact-locations heading to Five cities in all langs if present
  const loc = blocks.find((b) => b.section_key === "contact-locations");
  if (loc) {
    loc.fields.h2_html = "Five cities, <em>one</em> standard.";
    loc.fields_kn.h2_html = "ಐದು ನಗರಗಳು, <em>ಒಂದೇ</em> ಗುಣಮಟ್ಟ.";
    loc.fields_hi.h2_html = "पाँच शहर, <em>एक</em> मानक.";
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        source: src.source,
        note: "Live CMS snapshot including i18n — used by Reset to original",
        counts: {
          blocks: blocks.length,
          projects: projects.length,
          disciplines: disciplines.length,
        },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "content-blocks.json"),
    JSON.stringify(blocks, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "projects.json"),
    JSON.stringify(projects, null, 2),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "disciplines.json"),
    JSON.stringify(disciplines, null, 2),
  );

  console.log(
    `Baselines: ${blocks.length} blocks, ${projects.length} projects, ${disciplines.length} disciplines ← ${src.source}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
