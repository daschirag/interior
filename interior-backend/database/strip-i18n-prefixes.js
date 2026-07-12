/**
 * Strip [KN] / [HI] test prefixes from i18n placeholder columns.
 * Run: node database/strip-i18n-prefixes.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../src/config/db");

function stripFields(obj, tag) {
  if (!obj || typeof obj !== "object") return obj || {};
  const out = {};
  const re = new RegExp("^\\[" + tag + "\\]\\s*");
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    out[key] = typeof val === "string" ? val.replace(re, "") : val;
  });
  return out;
}

async function main() {
  const blocks = await pool.query(
    "SELECT id, fields_kn, fields_hi FROM content_blocks",
  );
  for (const row of blocks.rows) {
    await pool.query(
      `UPDATE content_blocks
       SET fields_kn = $1::jsonb, fields_hi = $2::jsonb
       WHERE id = $3`,
      [
        JSON.stringify(stripFields(row.fields_kn, "KN")),
        JSON.stringify(stripFields(row.fields_hi, "HI")),
        row.id,
      ],
    );
  }

  await pool.query(`
    UPDATE projects SET
      title_kn = regexp_replace(COALESCE(title_kn, ''), '^\\[KN\\]\\s*', ''),
      description_kn = regexp_replace(COALESCE(description_kn, ''), '^\\[KN\\]\\s*', ''),
      title_hi = regexp_replace(COALESCE(title_hi, ''), '^\\[HI\\]\\s*', ''),
      description_hi = regexp_replace(COALESCE(description_hi, ''), '^\\[HI\\]\\s*', '')
  `);

  await pool.query(`
    UPDATE disciplines SET
      title_kn = regexp_replace(COALESCE(title_kn, ''), '^\\[KN\\]\\s*', ''),
      scope_kn = regexp_replace(COALESCE(scope_kn, ''), '^\\[KN\\]\\s*', ''),
      title_hi = regexp_replace(COALESCE(title_hi, ''), '^\\[HI\\]\\s*', ''),
      scope_hi = regexp_replace(COALESCE(scope_hi, ''), '^\\[HI\\]\\s*', '')
  `);

  await pool.query(`
    UPDATE studios SET
      brand_kn = regexp_replace(COALESCE(brand_kn, ''), '^\\[KN\\]\\s*', ''),
      brand_hi = regexp_replace(COALESCE(brand_hi, ''), '^\\[HI\\]\\s*', '')
  `);

  const check = await pool.query(`
    SELECT fields_kn->>'kicker' AS kn_kicker, fields_hi->>'kicker' AS hi_kicker
    FROM content_blocks WHERE section_key = 'dashboard-hero'
  `);
  console.log(check.rows[0]);
  console.log("Prefixes removed.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
