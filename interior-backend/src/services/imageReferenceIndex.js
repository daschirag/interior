const pool = require("../config/db");

const CMS_FOLDER = "/interior-cms";

/**
 * Normalize image URLs for comparison (strip query/hash, keep pathname).
 * Handles full ImageKit URLs, relative /assets paths, and path-only values.
 */
function normalizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  const withoutQuery = trimmed.split("?")[0].split("#")[0];

  if (withoutQuery.startsWith("/")) {
    return withoutQuery.replace(/\/+/g, "/");
  }

  if (withoutQuery.startsWith("assets/")) {
    return `/${withoutQuery}`;
  }

  try {
    const parsed = new URL(withoutQuery);
    return parsed.pathname.replace(/\/+/g, "/");
  } catch {
    return withoutQuery.replace(/\/+/g, "/");
  }
}

function addReference(index, url, reference) {
  const key = normalizeImageUrl(url);
  if (!key) return;

  if (!index.has(key)) {
    index.set(key, []);
  }

  const list = index.get(key);
  const duplicate = list.some(
    (item) =>
      item.type === reference.type &&
      String(item.id) === String(reference.id) &&
      item.field === reference.field,
  );

  if (!duplicate) {
    list.push(reference);
  }
}

async function buildImageReferenceIndex() {
  const index = new Map();

  const [blocks, projects, disciplines, studios] = await Promise.all([
    pool.query(`
      SELECT section_key, section_label, images
      FROM content_blocks
    `),
    pool.query(`
      SELECT id, title, images, before_image_url, after_image_url
      FROM projects
      WHERE is_active = true
    `),
    pool.query(`
      SELECT id, title, image_url, images
      FROM disciplines
      WHERE is_active = true
    `),
    pool.query(`
      SELECT id, city, image_url
      FROM studios
      WHERE is_active = true
    `),
  ]);

  for (const block of blocks.rows) {
    const images = Array.isArray(block.images) ? block.images : [];
    for (const img of images) {
      if (!img?.url) continue;
      addReference(index, img.url, {
        type: "content_block",
        id: block.section_key,
        label: block.section_label || block.section_key,
        field: img.key ? `image:${img.key}` : "image",
      });
    }
  }

  for (const project of projects.rows) {
    const images = Array.isArray(project.images) ? project.images : [];
    images.forEach((url, i) => {
      if (!url) return;
      addReference(index, url, {
        type: "project",
        id: project.id,
        label: project.title || `Project #${project.id}`,
        field: i === 0 ? "cover_image" : `image_${i + 1}`,
      });
    });

    if (project.before_image_url) {
      addReference(index, project.before_image_url, {
        type: "project",
        id: project.id,
        label: project.title || `Project #${project.id}`,
        field: "before_image",
      });
    }

    if (project.after_image_url) {
      addReference(index, project.after_image_url, {
        type: "project",
        id: project.id,
        label: project.title || `Project #${project.id}`,
        field: "after_image",
      });
    }
  }

  for (const discipline of disciplines.rows) {
    if (discipline.image_url) {
      addReference(index, discipline.image_url, {
        type: "discipline",
        id: discipline.id,
        label: discipline.title || `Discipline #${discipline.id}`,
        field: "image_url",
      });
    }
    const gallery = Array.isArray(discipline.images) ? discipline.images : [];
    gallery.forEach((url, i) => {
      if (!url) return;
      addReference(index, url, {
        type: "discipline",
        id: discipline.id,
        label: discipline.title || `Discipline #${discipline.id}`,
        field: `images[${i}]`,
      });
    });
  }

  for (const studio of studios.rows) {
    if (!studio.image_url) continue;
    addReference(index, studio.image_url, {
      type: "studio",
      id: studio.id,
      label: studio.city || `Studio #${studio.id}`,
      field: "image_url",
    });
  }

  return index;
}

function lookupImageUsages(index, { url, filePath, name } = {}) {
  const keys = new Set();

  if (url) keys.add(normalizeImageUrl(url));
  if (filePath) keys.add(normalizeImageUrl(filePath));
  if (name) keys.add(normalizeImageUrl(`${CMS_FOLDER}/${name}`));

  const matches = [];
  for (const key of keys) {
    const refs = index.get(key);
    if (refs?.length) {
      matches.push(...refs);
    }
  }

  const seen = new Set();
  return matches.filter((ref) => {
    const sig = `${ref.type}:${ref.id}:${ref.field}`;
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });
}

module.exports = {
  CMS_FOLDER,
  normalizeImageUrl,
  buildImageReferenceIndex,
  lookupImageUsages,
};
