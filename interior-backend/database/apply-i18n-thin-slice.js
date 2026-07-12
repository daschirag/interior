/**
 * Thin i18n slice for visual QA: services-hero + Basalt House.
 * Also fixes English typo Penhouse → Penthouse.
 * Run: node database/apply-i18n-thin-slice.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

async function main() {
  // Fix English typo early so all langs share the corrected name
  const typo = await pool.query(`
    UPDATE projects
    SET title = 'Penthouse Fourteen'
    WHERE slug = 'penthouse-fourteen'
      AND title ILIKE '%penhouse%'
    RETURNING slug, title
  `);
  console.log("typo fix:", typo.rows[0] || "already correct");

  const basalt = await pool.query(
    `
    UPDATE projects
    SET
      title_kn = $1,
      description_kn = $2,
      title_hi = $3,
      description_hi = $4
    WHERE slug = 'the-basalt-house'
    RETURNING slug, title, title_kn, title_hi, left(description_kn, 60) AS kn_desc
    `,
    [
      "ದಿ ಬಸಾಲ್ಟ್ ಹೌಸ್",
      "ಕಪ್ಪು ಕಲ್ಲು ಮತ್ತು ಮೃದು ಬೆಳಕು. ಹೊರಗಿನ ಬಿಸಿಲನ್ನು ತಡೆದು ಒಳಗೆ ನೆಮ್ಮದಿ ಉಳಿಸುವ ಮನೆ — ಒಳಗಿನ ಹಸಿರು ಅಂಗಳವನ್ನು ಕೇಂದ್ರವಾಗಿಟ್ಟು ಕಟ್ಟಲಾಗಿದೆ.",
      "द बेसाल्ट हाउस",
      "काला पत्थर और धीमी रोशनी। बाहर की गर्मी रोककर अंदर शांति रखने वाला घर — अंदर के हरे आँगन के इर्द-गिर्द बना।",
    ],
  );
  console.log("basalt:", basalt.rows[0]);

  const fieldsKn = {
    kicker: "ಸ್ಟುಡಿಯೋ",
    h1_html: "ಕರಕುಶಲತೆಯ <em>ಮನೆ</em>.",
    lede: "ನಾವು ಒಂದು ಇಂಟೀರಿಯರ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಸ್ಟುಡಿಯೋ — ಚಿತ್ರಿಸಿ, ಮಾದರಿ ಮಾಡಿ, ಸಂಪೂರ್ಣ ವಾತಾವರಣಗಳನ್ನು ಕಟ್ಟುತ್ತೇವೆ. ಹದಿಮೂರು ವಿಭಾಗಗಳು, ಒಂದೇ ಗುಣಮಟ್ಟ.",
    link_text: "ಯೋಜನೆ ಆರಂಭಿಸಿ",
  };
  const fieldsHi = {
    kicker: "स्टूडियो",
    h1_html: "<em>शिल्प</em> का घर.",
    lede: "हम एक इंटीरियर आर्किटेक्चर स्टूडियो हैं — ड्रॉ करते हैं, मॉडल बनाते हैं, पूरे माहौल गढ़ते हैं। तेरह विधाएँ, एक ही स्तर का काम।",
    link_text: "प्रोजेक्ट शुरू करें",
  };

  const hero = await pool.query(
    `
    UPDATE content_blocks
    SET
      fields_kn = $1::jsonb,
      fields_hi = $2::jsonb
    WHERE section_key = 'services-hero'
    RETURNING section_key,
      fields_kn->>'kicker' AS kn_kicker,
      fields_hi->>'kicker' AS hi_kicker,
      fields_kn->>'link_text' AS kn_link,
      fields_hi->>'h1_html' AS hi_h1
    `,
    [JSON.stringify(fieldsKn), JSON.stringify(fieldsHi)],
  );
  console.log("services-hero:", hero.rows[0]);

  // Quick API sanity
  const kn = await pool.query(`
    SELECT fields_kn->>'h1_html' AS h1 FROM content_blocks WHERE section_key = 'services-hero'
  `);
  console.log("verify h1_kn:", kn.rows[0]?.h1);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
