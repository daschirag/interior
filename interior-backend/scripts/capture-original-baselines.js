/**
 * Refresh "Reset to original" baselines from the live Render API.
 *
 * Usage (from repo root):
 *   node interior-backend/scripts/capture-original-baselines.js
 */
const fs = require("fs");
const path = require("path");
const {
  projectToSnapshot,
  disciplineToSnapshot,
} = require("../src/utils/entitySnapshot");

const API_BASE =
  process.env.VINAYAK_API || "https://vinayak-interiors-api.onrender.com/api";
const OUT_DIR = path.join(__dirname, "..", "src", "data", "original-baselines");

async function fetchJson(pathname) {
  const res = await fetch(`${API_BASE}${pathname}`);
  if (!res.ok) {
    throw new Error(`GET ${pathname} failed: ${res.status}`);
  }
  return res.json();
}

async function main() {
  const [blocksJson, projectsJson, discsJson] = await Promise.all([
    fetchJson("/content-blocks"),
    fetchJson("/projects"),
    fetchJson("/disciplines"),
  ]);

  const blocks = (blocksJson.blocks || []).map((b) => ({
    page: b.page,
    section_key: b.section_key,
    section_label: b.section_label,
    fields: b.fields || {},
    images: b.images || [],
  }));
  const projects = (projectsJson.projects || []).map((p) =>
    projectToSnapshot(p),
  );
  const disciplines = (discsJson.disciplines || []).map((d) =>
    disciplineToSnapshot(d),
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUT_DIR, "meta.json"),
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        source: API_BASE,
        note: "Live CMS snapshot used by Reset to original",
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
    `Captured ${blocks.length} blocks, ${projects.length} projects, ${disciplines.length} disciplines → ${OUT_DIR}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
