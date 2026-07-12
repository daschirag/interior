/**
 * Seed PLACEHOLDER kn/hi translations for i18n system testing.
 * Not final copy — replace when real translations arrive.
 *
 * Run: node database/seed-i18n-placeholders.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = require("../src/config/db");
const ContentBlock = require("../src/models/contentBlockModel");
const Project = require("../src/models/projectModel");
const Discipline = require("../src/models/disciplineModel");
const Studio = require("../src/models/studioModel");

async function main() {
  await ContentBlock.createTable();
  await Project.createTable();
  await Discipline.createTable();
  await Studio.createTable();

  await pool.query(
    `
    UPDATE content_blocks
    SET
      fields_kn = COALESCE(fields, '{}'::jsonb) || $1::jsonb,
      fields_hi = COALESCE(fields, '{}'::jsonb) || $2::jsonb
    WHERE section_key = 'dashboard-hero'
  `,
    [
      JSON.stringify({
        kicker: "ವಿನಾಯಕ ಅಲ್ಯೂಮಿನಿಯಂ ಇಂಟೀರಿಯರ್ಸ್ — Est. MMXIV",
        h1_line1: "ನಾವು ರಚಿಸುತ್ತೇವೆ",
        h1_line2_html: "<em>ವಾತಾವರಣ</em>, ಕೊಠಡಿಗಳಲ್ಲ.",
        lede: "ಬೆಂಗಳೂರು, ವಿಜಯಪುರ, ಧಾರವಾಡ, ಕಲಬುರಗಿ ಮತ್ತು ಹೊಸಪೇಟೆ — ೨೦೧೪ರಿಂದ ಇಂಟೀರಿಯರ್ ಆರ್ಕಿಟೆಕ್ಚರ್.",
        stat_completed_label: "ಪೂರ್ಣಗೊಂಡ",
        stat_cities_label: "ನಗರಗಳು",
        stat_since_label: "ರಿಂದ",
        hero_tag_b: "ಲಗ್ಜರಿ ಲಿವಿಂಗ್ ರೂಮ್ — ಕರ್ನಾಟಕ",
      }),
      JSON.stringify({
        kicker: "विनायक एल्युमिनियम इंटीरियर्स — Est. MMXIV",
        h1_line1: "हम रचते हैं",
        h1_line2_html: "<em>माहौल</em>, कमरे नहीं।",
        lede: "बेंगलुरु, विजयपुरा, धारवाड़, कलबुर्गी और होस्पेट — २०१४ से इंटीरियर आर्किटेक्चर।",
        stat_completed_label: "पूर्ण",
        stat_cities_label: "शहर",
        stat_since_label: "से",
        hero_tag_b: "लक्ज़री लिविंग रूम — कर्नाटक",
      }),
    ],
  );

  await pool.query(`
    UPDATE projects
    SET
      title_kn = COALESCE(NULLIF(title_kn, ''), title),
      description_kn = COALESCE(NULLIF(description_kn, ''), description),
      title_hi = COALESCE(NULLIF(title_hi, ''), title),
      description_hi = COALESCE(NULLIF(description_hi, ''), description)
    WHERE is_active = true
  `);

  await pool.query(`
    UPDATE disciplines
    SET
      title_kn = COALESCE(NULLIF(title_kn, ''), title),
      scope_kn = COALESCE(NULLIF(scope_kn, ''), scope),
      title_hi = COALESCE(NULLIF(title_hi, ''), title),
      scope_hi = COALESCE(NULLIF(scope_hi, ''), scope)
    WHERE is_active = true
  `);

  await pool.query(`
    UPDATE studios
    SET
      brand_kn = COALESCE(NULLIF(brand_kn, ''), 'ವಿನಾಯಕ ಅಲ್ಯೂಮಿನಿಯಂ ಇಂಟೀರಿಯರ್ಸ್'),
      brand_hi = COALESCE(NULLIF(brand_hi, ''), 'विनायक एल्युमिनियम इंटीरियर्स')
    WHERE is_active = true
  `);

  const check = await pool.query(`
    SELECT section_key,
           fields_kn->>'lede' AS kn_lede,
           fields_hi->>'lede' AS hi_lede
    FROM content_blocks
    WHERE section_key = 'dashboard-hero'
  `);
  console.log("dashboard-hero placeholders:", check.rows[0] || "missing block");
  console.log("Done — placeholder i18n seed applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
