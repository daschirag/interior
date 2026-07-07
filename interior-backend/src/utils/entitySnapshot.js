/** Serializable project fields for entity_history snapshots. */
function projectToSnapshot(row) {
  if (!row) return null;
  return {
    title: row.title,
    slug: row.slug,
    location: row.location ?? null,
    year: row.year ?? null,
    area_sqft: row.area_sqft ?? null,
    project_type: row.project_type ?? null,
    description: row.description ?? null,
    material_tags: Array.isArray(row.material_tags) ? [...row.material_tags] : [],
    images: Array.isArray(row.images) ? [...row.images] : [],
    before_image_url: row.before_image_url ?? null,
    after_image_url: row.after_image_url ?? null,
    is_featured: row.is_featured ?? false,
    journey_order: row.journey_order ?? 0,
    is_active: row.is_active !== false,
  };
}

/** Serializable discipline fields for entity_history snapshots. */
function disciplineToSnapshot(row) {
  if (!row) return null;
  return {
    slug: row.slug,
    title: row.title,
    display_order: row.display_order ?? 0,
    subtitle: row.subtitle ?? null,
    headline: row.headline ?? null,
    description: row.description ?? null,
    budget_range: row.budget_range ?? null,
    timeline: row.timeline ?? null,
    scope: row.scope ?? null,
    tags: Array.isArray(row.tags) ? [...row.tags] : [],
    image_url: row.image_url ?? null,
    cta_projects_link: row.cta_projects_link ?? null,
    cta_consult_link: row.cta_consult_link ?? null,
    is_active: row.is_active !== false,
  };
}

function cloneSnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot || {}));
}

module.exports = {
  projectToSnapshot,
  disciplineToSnapshot,
  cloneSnapshot,
};
