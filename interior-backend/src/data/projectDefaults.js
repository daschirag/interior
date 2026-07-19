const fs = require("fs");
const path = require("path");
const { projectToSnapshot } = require("../utils/entitySnapshot");

const BASELINE_FILE = path.join(
  __dirname,
  "original-baselines",
  "projects.json",
);

let cachedProjects = null;

function getProjectDefaults() {
  if (!cachedProjects) {
    cachedProjects = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));
  }
  return cachedProjects;
}

function getDefaultProjectBySlug(slug) {
  const found = getProjectDefaults().find((p) => p.slug === slug);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

function getDefaultProjectByTitle(title) {
  const key = String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const found = getProjectDefaults().find((p) => {
    const t = String(p.title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    return t === key;
  });
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

/** Kept for scripts that still call the HTML scrape builder. */
function buildProjectDefaults() {
  return getProjectDefaults().map((row) => projectToSnapshot(row));
}

module.exports = {
  getProjectDefaults,
  getDefaultProjectBySlug,
  getDefaultProjectByTitle,
  buildProjectDefaults,
};
