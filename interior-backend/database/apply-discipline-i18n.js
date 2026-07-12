/**
 * Apply real kn/hi title+scope translations for all 13 disciplines.
 * Run: node database/apply-discipline-i18n.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

const ROWS = [
  {
    slug: "1-bhk-interiors",
    title_kn: "1 ಬಿಎಚ್‌ಕೆ ಇಂಟೀರಿಯರ್ಸ್",
    scope_kn: "ಸಂಪೂರ್ಣ ಸಜ್ಜಿಕೆ",
    title_hi: "1 बीएचके इंटीरियर्स",
    scope_hi: "पूरी सजावट",
  },
  {
    slug: "2-bhk-interiors",
    title_kn: "2 ಬಿಎಚ್‌ಕೆ ಇಂಟೀರಿಯರ್ಸ್",
    scope_kn: "ಸಂಪೂರ್ಣ ಒಳಾಂಗಣ",
    title_hi: "2 बीएचके इंटीरियर्स",
    scope_hi: "पूरा इंटीरियर",
  },
  {
    slug: "3-bhk-interiors",
    title_kn: "3 ಬಿಎಚ್‌ಕೆ ಇಂಟೀರಿಯರ್ಸ್",
    scope_kn: "ಸಂಪೂರ್ಣ ವಿನ್ಯಾಸ",
    title_hi: "3 बीएचके इंटीरियर्स",
    scope_hi: "पूरा डिज़ाइन",
  },
  {
    slug: "4-bhk-interiors",
    title_kn: "4 ಬಿಎಚ್‌ಕೆ ಇಂಟೀರಿಯರ್ಸ್",
    scope_kn: "ವಿಶೇಷ ಯೋಜನೆ",
    title_hi: "4 बीएचके इंटीरियर्स",
    scope_hi: "खास प्रोजेक्ट",
  },
  {
    slug: "modular-kitchen",
    title_kn: "ಮಾಡ್ಯುಲರ್ ಅಡುಗೆಮನೆ",
    scope_kn: "ಸಂಪೂರ್ಣ ಅಡುಗೆಮನೆ",
    title_hi: "मॉड्यूलर किचन",
    scope_hi: "पूरी किचन",
  },
  {
    slug: "luxury-living-rooms",
    title_kn: "ಐಷಾರಾಮಿ ಲಿವಿಂಗ್ ರೂಮ್",
    scope_kn: "ವಿಶೇಷ ಕೊಠಡಿ",
    title_hi: "लक्ज़री लिविंग रूम",
    scope_hi: "खास कमरा",
  },
  {
    slug: "aluminium-interiors",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಇಂಟೀರಿಯರ್ಸ್",
    scope_kn: "ಮಾಡ್ಯುಲರ್ ಘಟಕಗಳು",
    title_hi: "एल्युमिनियम इंटीरियर्स",
    scope_hi: "मॉड्यूलर यूनिट",
  },
  {
    slug: "aluminium-tv-unit",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಟಿವಿ ಯೂನಿಟ್",
    scope_kn: "ಒಂದೇ ಘಟಕ",
    title_hi: "एल्युमिनियम टीवी यूनिट",
    scope_hi: "एक यूनिट",
  },
  {
    slug: "aluminium-showcase",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಶೋಕೇಸ್",
    scope_kn: "ಪ್ರದರ್ಶನ ಘಟಕ",
    title_hi: "एल्युमिनियम शोकेस",
    scope_hi: "डिस्प्ले यूनिट",
  },
  {
    slug: "aluminium-dressing-table",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಡ್ರೆಸ್ಸಿಂಗ್ ಟೇಬಲ್",
    scope_kn: "ಬೆಡ್‌ರೂಮ್ ಘಟಕ",
    title_hi: "एल्युमिनियम ड्रेसिंग टेबल",
    scope_hi: "बेडरूम यूनिट",
  },
  {
    slug: "aluminium-pantry-unit",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಪ್ಯಾಂಟ್ರಿ ಯೂನಿಟ್",
    scope_kn: "ಪ್ಯಾಂಟ್ರಿ ಸಜ್ಜಿಕೆ",
    title_hi: "एल्युमिनियम पैंट्री यूनिट",
    scope_hi: "पैंट्री सजावट",
  },
  {
    slug: "aluminium-partition",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಪಾರ್ಟಿಷನ್",
    scope_kn: "ಪಾರ್ಟಿಷನ್ ವ್ಯವಸ್ಥೆ",
    title_hi: "एल्युमिनियम पार्टिशन",
    scope_hi: "पार्टिशन सिस्टम",
  },
  {
    slug: "aluminium-loft",
    title_kn: "ಅಲ್ಯೂಮಿನಿಯಂ ಲಾಫ್ಟ್",
    scope_kn: "ಲಾಫ್ಟ್ ಸಂಗ್ರಹಣೆ",
    title_hi: "एल्युमिनियम लॉफ्ट",
    scope_hi: "लॉफ्ट स्टोरेज",
  },
];

async function main() {
  let updated = 0;
  for (const row of ROWS) {
    const result = await pool.query(
      `
      UPDATE disciplines
      SET
        title_kn = $2,
        scope_kn = $3,
        title_hi = $4,
        scope_hi = $5
      WHERE slug = $1
      RETURNING slug, title_kn, scope_kn, title_hi, scope_hi
      `,
      [row.slug, row.title_kn, row.scope_kn, row.title_hi, row.scope_hi],
    );
    if (!result.rows.length) {
      console.error("MISSING slug:", row.slug);
      process.exit(1);
    }
    updated += 1;
    console.log("OK", result.rows[0].slug, "→", result.rows[0].title_kn, "/", result.rows[0].title_hi);
  }
  console.log("Updated", updated, "of", ROWS.length);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
