/**
 * Merge WhatsApp follow-card keys into contact-follow (EN + kn/hi).
 * Run: node database/apply-contact-wa-i18n.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

async function main() {
  const wa = {
    card_wa_title: "Message us on WhatsApp",
    card_wa_desc:
      "Chat with the studio for quick questions about timings, visits, or starting a brief.",
    card_wa_cta: "Open WhatsApp →",
  };
  const kn = {
    card_wa_title: "WhatsApp ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ",
    card_wa_desc:
      "ಸಮಯ, ಭೇಟಿ ಅಥವಾ ಬ್ರೀಫ್ ಆರಂಭದ ಬಗ್ಗೆ ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸ್ಟುಡಿಯೋ ಚಾಟ್ ಮಾಡಿ.",
    card_wa_cta: "WhatsApp ತೆರೆಯಿರಿ →",
  };
  const hi = {
    card_wa_title: "WhatsApp पर संदेश भेजें",
    card_wa_desc:
      "समय, विज़िट या ब्रीफ शुरू करने के त्वरित सवालों के लिए स्टूडियो से चैट करें।",
    card_wa_cta: "WhatsApp खोलें →",
  };

  const r = await pool.query(
    `
    UPDATE content_blocks SET
      fields = fields || $1::jsonb,
      fields_kn = fields_kn || $2::jsonb,
      fields_hi = fields_hi || $3::jsonb
    WHERE section_key = 'contact-follow'
    RETURNING
      fields->>'card_wa_title' AS en,
      fields_kn->>'card_wa_title' AS kn,
      fields_hi->>'card_wa_title' AS hi
    `,
    [JSON.stringify(wa), JSON.stringify(kn), JSON.stringify(hi)],
  );
  console.log(r.rows[0]);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
