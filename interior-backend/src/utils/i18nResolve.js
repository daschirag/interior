/**
 * Resolve public API rows into the requested language, falling back to English.
 * Never returns blank when an English value exists.
 */

const SUPPORTED = new Set(["en", "kn", "hi"]);

function parseLang(raw) {
  const lang = String(raw || "en")
    .trim()
    .toLowerCase();
  return SUPPORTED.has(lang) ? lang : "en";
}

function hasText(value) {
  return value != null && String(value).trim() !== "";
}

function pickText(translated, english) {
  return hasText(translated) ? String(translated) : english != null ? english : "";
}

function mergeFields(baseFields, translatedFields) {
  const base =
    baseFields && typeof baseFields === "object" && !Array.isArray(baseFields)
      ? baseFields
      : {};
  const translated =
    translatedFields &&
    typeof translatedFields === "object" &&
    !Array.isArray(translatedFields)
      ? translatedFields
      : {};

  const merged = { ...base };
  Object.keys(base).forEach((key) => {
    if (hasText(translated[key])) merged[key] = translated[key];
  });
  return merged;
}

function resolveContentBlock(row, lang) {
  if (!row || lang === "en") return row;
  const translated = lang === "kn" ? row.fields_kn : row.fields_hi;
  return {
    ...row,
    fields: mergeFields(row.fields, translated),
  };
}

function resolveProject(row, lang) {
  if (!row || lang === "en") return row;
  return {
    ...row,
    title: pickText(row[`title_${lang}`], row.title),
    description: pickText(row[`description_${lang}`], row.description),
  };
}

function resolveDiscipline(row, lang) {
  if (!row || lang === "en") return row;
  const tagsTranslated = row[`tags_${lang}`];
  const tags =
    Array.isArray(tagsTranslated) && tagsTranslated.length
      ? tagsTranslated
      : row.tags;
  return {
    ...row,
    title: pickText(row[`title_${lang}`], row.title),
    scope: pickText(row[`scope_${lang}`], row.scope),
    subtitle: pickText(row[`subtitle_${lang}`], row.subtitle),
    headline: pickText(row[`headline_${lang}`], row.headline),
    description: pickText(row[`description_${lang}`], row.description),
    tags,
  };
}

function resolveStudio(row, lang) {
  if (!row || lang === "en") return row;
  return {
    ...row,
    brand: pickText(row[`brand_${lang}`], row.brand),
  };
}

module.exports = {
  parseLang,
  resolveContentBlock,
  resolveProject,
  resolveDiscipline,
  resolveStudio,
};
