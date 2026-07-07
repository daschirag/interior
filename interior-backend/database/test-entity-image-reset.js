require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");
const Project = require("../src/models/projectModel");
const Discipline = require("../src/models/disciplineModel");
const EntityHistory = require("../src/models/entityHistoryModel");
const { getDefaultProjectBySlug } = require("../src/data/projectDefaults");
const { getDefaultDisciplineBySlug } = require("../src/data/disciplineDefaults");
const { projectToSnapshot, disciplineToSnapshot } = require("../src/utils/entitySnapshot");

const FAKE_URL = "https://ik.imagekit.io/vqyudydbj/test-fake-entity-upload.jpg";
const FAKE_TEXT = "ZZZ_CORRUPTED_TEST_VALUE";

function arraysEqual(a, b) {
  return JSON.stringify(a || []) === JSON.stringify(b || []);
}

function strEqual(a, b) {
  return String(a || "") === String(b || "");
}

async function corruptProject(project) {
  const corrupted = {
    ...projectToSnapshot(project),
    title: FAKE_TEXT + " " + project.title,
    description: FAKE_TEXT,
    images: [FAKE_URL],
    before_image_url: FAKE_URL,
    after_image_url: FAKE_URL,
  };
  return Project.applySnapshot(project.id, corrupted);
}

async function corruptDiscipline(discipline) {
  const corrupted = {
    ...disciplineToSnapshot(discipline),
    title: FAKE_TEXT + " " + discipline.title,
    description: FAKE_TEXT,
    image_url: FAKE_URL,
  };
  return Discipline.applySnapshot(discipline.id, corrupted);
}

async function testProjectReset(project) {
  const defaults = getDefaultProjectBySlug(project.slug);
  if (!defaults) {
    return { id: project.id, slug: project.slug, pass: false, step: "no-defaults" };
  }

  await corruptProject(project);
  const afterCorrupt = await Project.findById(project.id);
  const corruptOk =
    strEqual(afterCorrupt.description, FAKE_TEXT) &&
    strEqual(afterCorrupt.before_image_url, FAKE_URL) &&
    strEqual(afterCorrupt.after_image_url, FAKE_URL) &&
    arraysEqual(afterCorrupt.images, [FAKE_URL]);

  if (!corruptOk) {
    return { id: project.id, slug: project.slug, pass: false, step: "corrupt" };
  }

  await Project.applySnapshot(project.id, defaults);
  const afterReset = await Project.findById(project.id);

  const textPass =
    strEqual(afterReset.title, defaults.title) &&
    strEqual(afterReset.description, defaults.description) &&
    strEqual(afterReset.location, defaults.location);

  const imagePass =
    arraysEqual(afterReset.images, defaults.images) &&
    strEqual(afterReset.before_image_url, defaults.before_image_url) &&
    strEqual(afterReset.after_image_url, defaults.after_image_url);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    pass: textPass && imagePass,
    textPass,
    imagePass,
    defaults: {
      images: defaults.images,
      before_image_url: defaults.before_image_url,
      after_image_url: defaults.after_image_url,
    },
    reset: {
      images: afterReset.images,
      before_image_url: afterReset.before_image_url,
      after_image_url: afterReset.after_image_url,
    },
  };
}

async function testDisciplineReset(discipline) {
  const defaults = getDefaultDisciplineBySlug(discipline.slug);
  if (!defaults) {
    return { id: discipline.id, slug: discipline.slug, pass: false, step: "no-defaults" };
  }

  await corruptDiscipline(discipline);
  const afterCorrupt = await Discipline.findById(discipline.id);
  const corruptOk =
    strEqual(afterCorrupt.description, FAKE_TEXT) &&
    strEqual(afterCorrupt.image_url, FAKE_URL);

  if (!corruptOk) {
    return { id: discipline.id, slug: discipline.slug, pass: false, step: "corrupt" };
  }

  await Discipline.applySnapshot(discipline.id, defaults);
  const afterReset = await Discipline.findById(discipline.id);

  const textPass =
    strEqual(afterReset.title, defaults.title) &&
    strEqual(afterReset.description, defaults.description) &&
    strEqual(afterReset.budget_range, defaults.budget_range);

  const imagePass = strEqual(afterReset.image_url, defaults.image_url);

  return {
    id: discipline.id,
    slug: discipline.slug,
    title: discipline.title,
    pass: textPass && imagePass,
    textPass,
    imagePass,
    defaults: { image_url: defaults.image_url },
    reset: { image_url: afterReset.image_url },
  };
}

async function testProjectRestore(project) {
  const original = projectToSnapshot(project);
  await corruptProject(project);
  const historyRow = await EntityHistory.insertSnapshot({
    entityType: "project",
    entityId: project.id,
    snapshot: original,
    editedBy: "test@audit.local",
  });

  const corrupted = await Project.findById(project.id);
  const version = await EntityHistory.findById(historyRow.id);
  await Project.applySnapshot(project.id, version.snapshot);
  const restored = await Project.findById(project.id);

  const pass =
    strEqual(restored.title, original.title) &&
    strEqual(restored.description, original.description) &&
    arraysEqual(restored.images, original.images) &&
    strEqual(restored.before_image_url, original.before_image_url) &&
    strEqual(restored.after_image_url, original.after_image_url);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    pass,
    restoredImages: restored.images,
    originalImages: original.images,
  };
}

async function testDisciplineRestore(discipline) {
  const original = disciplineToSnapshot(discipline);
  await corruptDiscipline(discipline);
  const historyRow = await EntityHistory.insertSnapshot({
    entityType: "discipline",
    entityId: discipline.id,
    snapshot: original,
    editedBy: "test@audit.local",
  });

  const version = await EntityHistory.findById(historyRow.id);
  await Discipline.applySnapshot(discipline.id, version.snapshot);
  const restored = await Discipline.findById(discipline.id);

  const pass =
    strEqual(restored.title, original.title) &&
    strEqual(restored.description, original.description) &&
    strEqual(restored.image_url, original.image_url);

  return {
    id: discipline.id,
    slug: discipline.slug,
    title: discipline.title,
    pass,
    restoredImage: restored.image_url,
    originalImage: original.image_url,
  };
}

async function main() {
  await Project.createTable();
  await Discipline.createTable();
  await EntityHistory.createTable();

  const projectsRes = await pool.query(
    "SELECT * FROM projects WHERE is_active = true ORDER BY journey_order ASC",
  );
  const disciplinesRes = await pool.query(
    "SELECT * FROM disciplines WHERE is_active = true ORDER BY display_order ASC LIMIT 3",
  );

  const projects = projectsRes.rows;
  const disciplines = disciplinesRes.rows;

  console.log("\n=== Entity reset audit (corrupt → reset-to-default) ===\n");
  console.log("| Entity | Cover / expand image | Before | After | Text | Overall |");
  console.log("|--------|----------------------|--------|-------|------|---------|");

  let allPass = true;

  for (const project of projects) {
    const r = await testProjectReset(project);
    if (!r.pass) allPass = false;
    const hasBeforeAfter = !!(r.defaults?.before_image_url || r.defaults?.after_image_url);
    console.log(
      `| project:${r.slug} | images:${r.pass ? "OK" : "FAIL"} | before:${hasBeforeAfter ? (r.imagePass ? "OK" : "FAIL") : "n/a"} | after:${hasBeforeAfter ? (r.imagePass ? "OK" : "FAIL") : "n/a"} | text:${r.textPass ? "OK" : "FAIL"} | ${r.pass ? "PASS" : "FAIL"} |`,
    );
    if (!r.pass) {
      console.log("  defaults:", r.defaults);
      console.log("  after reset:", r.reset);
    }
  }

  for (const discipline of disciplines) {
    const r = await testDisciplineReset(discipline);
    if (!r.pass) allPass = false;
    console.log(
      `| discipline:${r.slug} | image:${r.imagePass ? "OK" : "FAIL"} | n/a | n/a | text:${r.textPass ? "OK" : "FAIL"} | ${r.pass ? "PASS" : "FAIL"} |`,
    );
    if (!r.pass) {
      console.log("  defaults:", r.defaults);
      console.log("  after reset:", r.reset);
    }
  }

  console.log("\n=== Entity restore audit (corrupt → restore from history) ===\n");

  const projectWithBa = projects.find((p) => p.before_image_url && p.after_image_url) || projects[0];
  const pr = await testProjectRestore(projectWithBa);
  if (!pr.pass) allPass = false;
  console.log(
    `| project restore: ${pr.slug} | images+text | ${pr.pass ? "PASS" : "FAIL"} |`,
  );

  const dr = await testDisciplineRestore(disciplines[0]);
  if (!dr.pass) allPass = false;
  console.log(
    `| discipline restore: ${dr.slug} | image+text | ${dr.pass ? "PASS" : "FAIL"} |`,
  );

  console.log(`\nOverall: ${allPass ? "ALL PASS" : "SOME FAILED"}`);
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
