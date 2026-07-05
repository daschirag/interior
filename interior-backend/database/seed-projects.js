/**
 * Seeds projects from public/Projects.html journey panels + dashboard featured cards.
 * Run: node database/seed-projects.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");
const Project = require("../src/models/projectModel");

const PROJECTS_HTML = path.join(__dirname, "..", "..", "public", "Projects.html");
const DASHBOARD_HTML = path.join(__dirname, "..", "..", "public", "dashboard.html");

function decodeHtml(text) {
  return String(text || "")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
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

function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseFeaturedImages(dashboardHtml) {
  const map = {};
  const cards =
    dashboardHtml.match(/<a class="proj-card"[\s\S]*?<\/a>/g) || [];

  cards.forEach((card) => {
    const title = decodeHtml(
      (card.match(/<span class="pt">([\s\S]*?)<\/span>/) || [])[1],
    );
    const image =
      (card.match(/data-lazy-bg="([^"]+)"/) || [])[1] || null;
    if (title && image) {
      map[normalizeTitle(title)] = image;
    }
  });

  return map;
}

function parseJourneyProjects(projectsHtml, featuredByTitle) {
  const projects = [];
  const panels =
    projectsHtml.match(/<article class="hpanel">[\s\S]*?<\/article>/g) || [];

  panels.forEach((panel, index) => {
    const title = decodeHtml(
      (panel.match(/<h3 class="hpanel-ttl">([\s\S]*?)<\/h3>/) || [])[1],
    );
    const location = decodeHtml(
      (panel.match(
        /<div class="a">City<\/div><div class="b">([\s\S]*?)<\/div>/,
      ) || [])[1],
    );
    const projectType = decodeHtml(
      (panel.match(
        /<div class="a">Type<\/div><div class="b">([\s\S]*?)<\/div>/,
      ) || [])[1],
    );
    const yearText = decodeHtml(
      (panel.match(
        /<div class="a">Year<\/div><div class="b">([\s\S]*?)<\/div>/,
      ) || [])[1],
    );
    const year = yearText ? parseInt(yearText, 10) : null;
    const description = decodeHtml(
      (panel.match(/<p class="hpanel-desc">([\s\S]*?)<\/p>/) || [])[1],
    );
    const tagsBlock =
      (panel.match(/<div class="hpanel-tags">([\s\S]*?)<\/div>/) || [])[1] || "";
    const materialTags = (tagsBlock.match(/<span>([\s\S]*?)<\/span>/g) || [])
      .map((span) => decodeHtml(span.replace(/<\/?span>/g, "")))
      .filter(Boolean);
    const panelImage =
      (panel.match(/data-lazy-bg="([^"]+)"/) || [])[1] || null;
    const featuredImage = featuredByTitle[normalizeTitle(title)] || null;

    const images = [];
    if (panelImage) images.push(panelImage);
    if (featuredImage && featuredImage !== panelImage) images.push(featuredImage);

    projects.push({
      title,
      slug: slugify(title),
      location: location || null,
      year: Number.isFinite(year) ? year : null,
      area_sqft: null,
      project_type: projectType || null,
      description: description || null,
      material_tags: materialTags,
      images,
      before_image_url: null,
      after_image_url: null,
      is_featured: true,
      journey_order: index + 1,
    });
  });

  return projects;
}

function attachBeforeAfter(projects, projectsHtml) {
  const beforeImage =
    (projectsHtml.match(/id="baBeforeInner"[^>]*data-lazy-bg="([^"]+)"/) ||
      [])[1] || null;
  const afterImage =
    (projectsHtml.match(/id="baAfter"[^>]*data-lazy-bg="([^"]+)"/) || [])[1] ||
    null;
  const caption = decodeHtml(
    (projectsHtml.match(/data-cms-ba-caption>([\s\S]*?)<\/p>/) || [])[1],
  );

  if (!beforeImage || !afterImage || !caption) return projects;

  const baTitle = caption.split("—")[0].trim();
  const baKey = normalizeTitle(baTitle);

  return projects.map((project) => {
    if (normalizeTitle(project.title) === baKey) {
      return {
        ...project,
        before_image_url: beforeImage,
        after_image_url: afterImage,
      };
    }
    return project;
  });
}

async function main() {
  await pool.query("DELETE FROM projects WHERE title = $1", [
    "Step1 Test Project",
  ]);

  const projectsHtml = fs.readFileSync(PROJECTS_HTML, "utf8");
  const dashboardHtml = fs.readFileSync(DASHBOARD_HTML, "utf8");
  const featuredByTitle = parseFeaturedImages(dashboardHtml);
  let projects = parseJourneyProjects(projectsHtml, featuredByTitle);
  projects = attachBeforeAfter(projects, projectsHtml);

  if (projects.length !== 3) {
    console.error("Expected 3 projects from Projects.html, got", projects.length);
    process.exit(1);
  }

  await Project.createTable();

  for (const project of projects) {
    const saved = await Project.upsertBySlug(project);
    console.log("Seeded project:", saved.title);
  }

  const count = await pool.query(
    "SELECT COUNT(*)::int AS n FROM projects WHERE is_active = true",
  );
  console.log("Done — projects count:", count.rows[0].n);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
