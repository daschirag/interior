const fs = require("fs");
const path = require("path");
const { disciplineToSnapshot } = require("../utils/entitySnapshot");

const BASELINE_FILE = path.join(
  __dirname,
  "original-baselines",
  "disciplines.json",
);

let cachedDisciplines = null;

function getDisciplineDefaults() {
  if (!cachedDisciplines) {
    cachedDisciplines = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));
  }
  return cachedDisciplines;
}

function getDefaultDisciplineBySlug(slug) {
  const found = getDisciplineDefaults().find((d) => d.slug === slug);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

/** Kept for scripts that still call the HTML scrape builder. */
function buildDisciplineDefaults() {
  return getDisciplineDefaults().map((row) => disciplineToSnapshot(row));
}

module.exports = {
  getDisciplineDefaults,
  getDefaultDisciplineBySlug,
  buildDisciplineDefaults,
};
