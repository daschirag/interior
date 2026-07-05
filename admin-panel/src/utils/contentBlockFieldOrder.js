const FIELD_PRIORITY = [
  "kicker",
  "h1_line1",
  "h1_line2_html",
  "h1_html",
  "h2_html",
  "statement_html",
  "lede",
  "body",
  "intro",
  "caption",
  "hint_text",
  "foot_body",
  "foot_link_text",
  "link_text",
  "aside_note",
  "meta_coords_html",
  "plate_mark",
  "hero_tag_b",
  "btn_primary_label",
  "btn_secondary_label",
  "stat_completed_label",
  "stat_completed_value",
  "stat_cities_label",
  "stat_cities_value",
  "stat_since_label",
  "stat_since_value",
];

export function sortContentFieldKeys(keys) {
  return [...keys].sort((a, b) => {
    const ai = FIELD_PRIORITY.indexOf(a);
    const bi = FIELD_PRIORITY.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function getHtmlFieldHint(key) {
  if (!key.endsWith("_html") && !key.includes("html")) return null;
  if (key === "statement_html") {
    return "Use <span class=\"w\">word</span> for animated words. <span class=\"w azure\"> highlights in blue.";
  }
  return "Basic HTML allowed: <em>italic</em>, <br>, <span class=\"brass\">gold</span>.";
}
