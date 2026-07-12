/**
 * Full i18n rollout: remaining projects + all content_blocks kn/hi.
 * Tone matches approved thin-slice (services-hero + Basalt).
 * Run: node database/apply-i18n-full-rollout.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

const PROJECTS = {
  "penthouse-fourteen": {
    title_kn: "ಪೆಂಟ್‌ಹೌಸ್ ಫೋರ್ಟೀನ್",
    description_kn:
      "ಟ್ರಾವರ್ಟೈನ್ ಬೆನ್ನೆಲುಬಿನ ಸುತ್ತ ರಚಿಸಿದ ಆಕಾಶಮಟ್ಟದ ಮನೆ — ಸಾರ್ವಜನಿಕದಿಂದ ಖಾಸಗಿಗೆ ಮನಸ್ಥಿತಿ ಬದಲಾಗುವ ಪ್ರತಿ ಹೆಜ್ಜೆಯಲ್ಲೂ ಹಿತ್ತಾಳೆಯ ಮಿತಿಗಳು.",
    title_hi: "पेंटहाउस फोरटीन",
    description_hi:
      "ट्रैवर्टीन की रीढ़ के इर्द-गिर्द रचा आकाश-स्तर का घर — सार्वजनिक से निजी मूड बदलते हर पड़ाव पर पीतल की चौखटें।",
  },
  "linen-oak": {
    title_kn: "ಲಿನೆನ್ & ಓಕ್",
    description_kn:
      "ಯುವ ಕುಟುಂಬಕ್ಕಾಗಿ ಮೃದು, ಪ್ರಕಾಶಮಯ ಅಪಾರ್ಟ್‌ಮೆಂಟ್ — ರಿಫ್ಟ್ ಓಕ್, ಕಚ್ಚಾ ಲಿನೆನ್, ಮತ್ತು ಲಿವಿಂಗ್ ರೂಮ್‌ಗೆ ಪೂರ್ಣವಾಗಿ ತೆರೆಯುವ ಅಡುಗೆಮನೆ.",
    title_hi: "लिनन एंड ओक",
    description_hi:
      "एक युवा परिवार के लिए नरम, उजली अपार्टमेंट — रिफ्ट ओक, कच्चा लिनन, और लिविंग रूम तक पूरी तरह खुलता किचन।",
  },
  // Keep / refresh Basalt (already approved) so script is idempotent
  "the-basalt-house": {
    title_kn: "ದಿ ಬಸಾಲ್ಟ್ ಹೌಸ್",
    description_kn:
      "ಕಪ್ಪು ಕಲ್ಲು ಮತ್ತು ಮೃದು ಬೆಳಕು. ಹೊರಗಿನ ಬಿಸಿಲನ್ನು ತಡೆದು ಒಳಗೆ ನೆಮ್ಮದಿ ಉಳಿಸುವ ಮನೆ — ಒಳಗಿನ ಹಸಿರು ಅಂಗಳವನ್ನು ಕೇಂದ್ರವಾಗಿಟ್ಟು ಕಟ್ಟಲಾಗಿದೆ.",
    title_hi: "द बेसाल्ट हाउस",
    description_hi:
      "काला पत्थर और धीमी रोशनी। बाहर की गर्मी रोककर अंदर शांति रखने वाला घर — अंदर के हरे आँगन के इर्द-गिर्द बना।",
  },
};

/** @type {Record<string, { kn: Record<string, string>, hi: Record<string, string> }>} */
const BLOCKS = {
  "dashboard-hero": {
    kn: {
      kicker: "ವಿನಾಯಕ ಅಲ್ಯೂಮಿನಿಯಂ ಇಂಟೀರಿಯರ್ಸ್ — Est. MMXIV",
      h1_line1: "ನಾವು ರಚಿಸುತ್ತೇವೆ",
      h1_line2_html: "<em>ವಾತಾವರಣ</em>, ಕೊಠಡಿಗಳಲ್ಲ.",
      lede: "ಬೆಳಕು, ವಸ್ತು ಮತ್ತು ಅನುಪಾತದಿಂದ ಆಕಾರ ಕೊಡುವ ಇಂಟೀರಿಯರ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಸ್ಟುಡಿಯೋ — ವಿಜಯಪುರ, ಧಾರವಾಡ, ಕಲಬುರಗಿ ಮತ್ತು ಹೊಸಪೇಟೆ. ಒಂದು ಅಡುಗೆಮನೆಯಿಂದ ಪೂರ್ಣ ನಿವಾಸದವರೆಗೆ.",
      meta_coords_html: "ಕರ್ನಾಟಕ<br>ಇಂಟೀರಿಯರ್ ಆರ್ಕಿಟೆಕ್ಚರ್",
      stat_completed_label: "ಪೂರ್ಣಗೊಂಡ",
      stat_completed_value: "240+",
      stat_cities_label: "ನಗರಗಳು",
      stat_cities_value: "04",
      stat_since_label: "ರಿಂದ",
      stat_since_value: "MMXIV",
      hero_tag_b: "ಲಗ್ಜರಿ ಲಿವಿಂಗ್ ರೂಮ್ — ಕರ್ನಾಟಕ",
      plate_mark: "PLATE 01 · ƒ/1.8",
    },
    hi: {
      kicker: "विनायक एल्युमिनियम इंटीरियर्स — Est. MMXIV",
      h1_line1: "हम रचते हैं",
      h1_line2_html: "<em>माहौल</em>, कमरे नहीं।",
      lede: "प्रकाश, सामग्री और अनुपात से आकार देने वाला इंटीरियर आर्किटेक्चर स्टूडियो — विजयपुरा, धारवाड़, कलबुर्गी और होस्पेट। एक किचन से लेकर पूरा घर।",
      meta_coords_html: "कर्नाटक<br>इंटीरियर आर्किटेक्चर",
      stat_completed_label: "पूर्ण",
      stat_completed_value: "240+",
      stat_cities_label: "शहर",
      stat_cities_value: "04",
      stat_since_label: "से",
      stat_since_value: "MMXIV",
      hero_tag_b: "लक्ज़री लिविंग रूम — कर्नाटक",
      plate_mark: "PLATE 01 · ƒ/1.8",
    },
  },
  "dashboard-manifesto": {
    kn: {
      kicker: "01 — ತತ್ತ್ವಶಾಸ್ತ್ರ",
      statement_html:
        '<span class="w">ಮನೆಯನ್ನು</span> <span class="w">ಅಲಂಕರಿಸುವುದಿಲ್ಲ.</span> <span class="w azure">ಅದನ್ನು</span> <span class="w azure"><em>ರಚಿಸಲಾಗುತ್ತದೆ</em></span> <span class="w">—</span> <span class="w">ಬೆಳಕು,</span> <span class="w">ಅನುಪಾತ</span> <span class="w">ಮತ್ತು</span> <span class="w">ವಸ್ತು</span> <span class="w">ಜೋಡಿಸಿ,</span> <span class="w">ಜಾಗ</span> <span class="w">ಕೊನೆಗೆ</span> <span class="w">ನಿಮ್ಮಂತೆ</span> <span class="w">ಕೇಳುವವರೆಗೆ.</span>',
      foot_body:
        "ಪ್ರತಿ ಬ್ರೀಫ್ ಅನ್ನು ನಾವು ಸಣ್ಣ ಆರ್ಕಿಟೆಕ್ಚರ್ ಕೃತಿಯಂತೆ ನೋಡುತ್ತೇವೆ — ಒಂದು ಗೋಡೆಯನ್ನು ಮುಟ್ಟುವ ಮುನ್ನ ಚಿತ್ರಿಸಿ, ಮಾದರಿ ಮಾಡಿ, ಪರೀಕ್ಷಿಸುತ್ತೇವೆ.",
      foot_link_text: "ಸ್ಟುಡಿಯೋ ವಿಧಾನ",
    },
    hi: {
      kicker: "01 — दर्शन",
      statement_html:
        '<span class="w">घर</span> <span class="w">सजाया</span> <span class="w">नहीं</span> <span class="w">जाता.</span> <span class="w azure">उसे</span> <span class="w azure"><em>रचा</em></span> <span class="w azure">जाता</span> <span class="w azure">है</span> <span class="w">—</span> <span class="w">प्रकाश,</span> <span class="w">अनुपात</span> <span class="w">और</span> <span class="w">सामग्री</span> <span class="w">जब</span> <span class="w">तक</span> <span class="w">जगह</span> <span class="w">आपकी</span> <span class="w">तरह</span> <span class="w">न</span> <span class="w">लगने</span> <span class="w">लगे.</span>',
      foot_body:
        "हर ब्रीफ को हम छोटी वास्तुकला की तरह लेते हैं — दीवार छूने से पहले ड्रॉ, मॉडल और जांच।",
      foot_link_text: "स्टूडियो का नज़रिया",
    },
  },
  "dashboard-materials-teaser": {
    kn: {
      kicker: "04 — ಮೆಟೀರಿಯಲ್ ಲೈಬ್ರರಿ",
      h2_html: "<em>ಪ್ಯಾಲೆಟ್</em> ಅನ್ನು ಸ್ಪರ್ಶಿಸಿ.",
      link_text: "ವಸ್ತುಗಳನ್ನು ನೋಡಿ",
      mat_1_name: "ಮಾರ್ಬಲ್",
      mat_2_name: "ಓಕ್",
      mat_3_name: "ಬ್ರಾಸ್",
      mat_4_name: "ಸ್ಟೋನ್",
      mat_5_name: "ಲಿನೆನ್",
      mat_1_subtitle: "Carrara · Statuario",
      mat_2_subtitle: "Smoked · Rift",
      mat_3_subtitle: "Antique · Brushed",
      mat_4_subtitle: "Basalt · Travertine",
      mat_5_subtitle: "Belgian · Raw",
    },
    hi: {
      kicker: "04 — मटेरियल लाइब्रेरी",
      h2_html: "<em>पैलेट</em> को छुएं.",
      link_text: "सामग्री देखें",
      mat_1_name: "मार्बल",
      mat_2_name: "ओक",
      mat_3_name: "ब्रास",
      mat_4_name: "स्टोन",
      mat_5_name: "लिनन",
      mat_1_subtitle: "Carrara · Statuario",
      mat_2_subtitle: "Smoked · Rift",
      mat_3_subtitle: "Antique · Brushed",
      mat_4_subtitle: "Basalt · Travertine",
      mat_5_subtitle: "Belgian · Raw",
    },
  },
  "dashboard-process-mini": {
    kn: {
      kicker: "05 — ನಾವು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ",
      h2_html: "ಐದು ಚಲನೆಗಳು, <span class=\"brass\">ಒಂದು</span> ಮನೆ.",
      link_text: "ಪೂರ್ಣ ಪ್ರಕ್ರಿಯೆ ನೋಡಿ",
      step_1_title: "ಕಾನ್ಸೆಪ್ಟ್",
      step_2_title: "ಡಿಸೈನ್",
      step_3_title: "ವಿಷುವಲೈಸ್",
      step_4_title: "ಎಕ್ಸಿಕ್ಯೂಟ್",
      step_5_title: "ರಿವೀಲ್",
      step_1_body: "ನಾವು ಕೇಳುತ್ತೇವೆ, ನಂತರ ಜಾಗದ ಆಕಾರಕ್ಕಿಂತ ಮೊದಲು ಅದರ ಕಲ್ಪನೆಯನ್ನು ಚಿತ್ರಿಸುತ್ತೇವೆ.",
      step_2_body: "ಡ್ರಾಯಿಂಗ್‌ಗಳು, ಲೇಔಟ್‌ಗಳು ಮತ್ತು ಮೆಟೀರಿಯಲ್ ಬೋರ್ಡ್‌ಗಳು — ಮಿಲಿಮೀಟರ್‌ವರೆಗೆ ನಿರ್ಧಾರ.",
      step_3_body: "ಫೋಟೋರಿಯಲ್ ರೆಂಡರ್‌ಗಳಿಂದ ಮನೆ ಕಟ್ಟುವ ಮುನ್ನ ನಡೆದು ನೋಡಬಹುದು.",
      step_4_body: "ನಮ್ಮ ಕುಶಲಕರ್ಮಿಗಳು ಡ್ರಾಯಿಂಗ್‌ಗೆ ಅನುಗುಣವಾಗಿ ಕಟ್ಟುತ್ತಾರೆ — ಆರಂಭದಿಂದ ಅಂತ್ಯದವರೆಗೆ ಮೇಲ್ವಿಚಾರಣೆ.",
      step_5_body: "ಪೂರ್ಣ, ಸ್ಟೈಲ್ ಮಾಡಿದ, ಫೋಟೋಗೆ ಸಿದ್ಧ ಮನೆಯನ್ನು ಹಸ್ತಾಂತರಿಸುತ್ತೇವೆ.",
    },
    hi: {
      kicker: "05 — हम कैसे काम करते हैं",
      h2_html: "पाँच चरण, <span class=\"brass\">एक</span> घर.",
      link_text: "पूरी प्रक्रिया देखें",
      step_1_title: "कॉन्सेप्ट",
      step_2_title: "डिज़ाइन",
      step_3_title: "विज़ुअलाइज़",
      step_4_title: "एक्ज़िक्यूट",
      step_5_title: "रिवील",
      step_1_body: "हम सुनते हैं, फिर जगह का आकार आने से पहले उसका आइडिया स्केच करते हैं.",
      step_2_body: "ड्रॉइंग, लेआउट और मटेरियल बोर्ड — मिलीमीटर तक तय.",
      step_3_body: "फोटोरियल रेंडर से घर बनने से पहले आप उसमें चल सकते हैं.",
      step_4_body: "हमारे कारीगर ड्रॉइंग के हिसाब से बनाते हैं — शुरू से अंत तक निगरानी.",
      step_5_body: "हम एक पूरा, स्टाइल किया, फोटो-रेडी घर सौंपते हैं.",
    },
  },
  "dashboard-cta-band": {
    kn: {
      kicker: "ಆರಂಭ",
      h2_html: "ನಿಮ್ಮ ಜಾಗವನ್ನು<br><em>ರಚಿಸೋಣ</em>.",
      lede: "ಪ್ರತಿ ವಿನಾಯಕ ಇಂಟೀರಿಯರ್ಸ್ ಯೋಜನೆ ಖಾಸಗಿ ಸಮಾಲೋಚನೆಯಿಂದ ಆರಂಭವಾಗುತ್ತದೆ. ನಿಮ್ಮ ಮನೆಯ ಬಗ್ಗೆ ಹೇಳಿ — ಡ್ರಾಯಿಂಗ್‌ಗಳನ್ನು ನಾವು ತರುತ್ತೇವೆ.",
      btn_primary_label: "ಸಮಾಲೋಚನೆ ನಿಗದಿ ಮಾಡಿ",
      btn_secondary_label: "ಯೋಜನೆಗಳನ್ನು ನೋಡಿ",
    },
    hi: {
      kicker: "शुरूआत",
      h2_html: "आइए आपकी जगह<br><em>रचें</em>.",
      lede: "हर विनायक इंटीरियर्स प्रोजेक्ट एक निजी बातचीत से शुरू होता है। अपने घर के बारे में बताएं — ड्रॉइंग हम लाएंगे.",
      btn_primary_label: "परामर्श बुक करें",
      btn_secondary_label: "प्रोजेक्ट्स देखें",
    },
  },
  "projects-hero": {
    kn: {
      kicker: "ಆಯ್ದ ಕೆಲಸ — 2021 / 2026",
      h1_html: "ದಿ <em>ಪೋರ್ಟ್‌ಫೋಲಿಯೋ</em>.",
      lede: "ಪ್ರತಿ ಯೋಜನೆ ಒಂದು ರಚನೆ — ಬೆಳಕು, ಅನುಪಾತ ಮತ್ತು ವಸ್ತುವಿನ ಮೂಲಕ ಬ್ರೀಫ್ ಪರಿಹಾರ. ಮೂರು ಇತ್ತೀಚಿನ ಮನೆಗಳನ್ನು ಸ್ಕ್ರಾಲ್ ಮಾಡಿ, ನಂತರ ಡಿವೈಡರ್ ಎಳೆದು ಒಂದು ಬದಲಾವಣೆಯನ್ನು ನೋಡಿ.",
      stat_completed_label: "ಪೂರ್ಣಗೊಂಡ",
      stat_completed_value: "240+",
      stat_cities_label: "ನಗರಗಳು",
      stat_cities_value: "04",
      stat_since_label: "ರಿಂದ",
      stat_since_value: "MMXXI",
    },
    hi: {
      kicker: "चुने हुए काम — 2021 / 2026",
      h1_html: "द <em>पोर्टफोलियो</em>.",
      lede: "हर प्रोजेक्ट एक रचना है — प्रकाश, अनुपात और सामग्री से हल हुआ ब्रीफ। तीन हाल के घर स्क्रॉल करें, फिर डिवाइडर खींचकर एक बदलाव देखें.",
      stat_completed_label: "पूर्ण",
      stat_completed_value: "240+",
      stat_cities_label: "शहर",
      stat_cities_value: "04",
      stat_since_label: "से",
      stat_since_value: "MMXXI",
    },
  },
  "projects-journey-intro": {
    kn: {
      kicker: "ಪ್ರಾಜೆಕ್ಟ್ ಪ್ರಯಾಣಗಳು",
      h2_html: "ಮೂರು ಮನೆಗಳು, <span class=\"brass\">ಎಡದಿಂದ ಬಲಕ್ಕೆ</span> ಹೇಳಲಾಗಿದೆ.",
      body: "ಸ್ಕ್ರಾಲ್ ಮಾಡಿದಂತೆ ಗ್ಯಾಲರಿ ಅಡ್ಡವಾಗಿ ಚಲಿಸುತ್ತದೆ — ಪ್ರತಿ ಮನೆ ಒಂದು ಅಧ್ಯಾಯ. ಮುಂದುವರಿಸಿ, ರೂಪಾಂತರಗಳನ್ನು ತಲುಪಿ.",
    },
    hi: {
      kicker: "प्रोजेक्ट यात्राएँ",
      h2_html: "तीन घर, <span class=\"brass\">बाएँ से दाएँ</span> सुनाए.",
      body: "स्क्रॉल करते ही गैलरी क्षैतिज चलती है — हर घर एक अध्याय। आगे बढ़ें, रूपांतरण तक पहुँचें.",
    },
  },
  "projects-transformation": {
    kn: {
      kicker: "ರೂಪಾಂತರ",
      h2_html: "ಮೊದಲು, ಮತ್ತು <em>ನಂತರ</em>.",
      caption:
        "ಪೆಂಟ್‌ಹೌಸ್ ಫೋರ್ಟೀನ್ — ಲಿವಿಂಗ್ ರೂಮ್, ಹಾಗೆ ಸಿಕ್ಕಿತು ಮತ್ತು ಹಾಗೆ ರಚಿಸಲಾಯಿತು. ಡಿವೈಡರ್ ಎಳೆಯಿರಿ.",
    },
    hi: {
      kicker: "रूपांतरण",
      h2_html: "पहले, और <em>बाद</em>.",
      caption:
        "पेंटहाउस फोरटीन — लिविंग रूम, जैसा मिला और जैसा रचा। डिवाइडर खींचें.",
    },
  },
  "projects-cta": {
    kn: {
      kicker: "ಮುಂದೆ ನಿಮ್ಮ ಯೋಜನೆ",
      h2_html: "ಒಂದು <span class=\"brass\">ರಚನೆ</span> ಆರಂಭಿಸಿ.",
      btn_primary_label: "ಸಮಾಲೋಚನೆ ನಿಗದಿ ಮಾಡಿ",
      btn_secondary_label: "ಸ್ಟುಡಿಯೋ ನೋಡಿ",
    },
    hi: {
      kicker: "अगला आपका प्रोजेक्ट",
      h2_html: "एक <span class=\"brass\">रचना</span> शुरू करें.",
      btn_primary_label: "परामर्श बुक करें",
      btn_secondary_label: "स्टूडियो देखें",
    },
  },
  "services-hero": {
    kn: {
      kicker: "ಸ್ಟುಡಿಯೋ",
      h1_html: "ಕರಕುಶಲತೆಯ <em>ಮನೆ</em>.",
      lede: "ನಾವು ಒಂದು ಇಂಟೀರಿಯರ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಸ್ಟುಡಿಯೋ — ಚಿತ್ರಿಸಿ, ಮಾದರಿ ಮಾಡಿ, ಸಂಪೂರ್ಣ ವಾತಾವರಣಗಳನ್ನು ಕಟ್ಟುತ್ತೇವೆ. ಹದಿಮೂರು ವಿಭಾಗಗಳು, ಒಂದೇ ಗುಣಮಟ್ಟ.",
      link_text: "ಯೋಜನೆ ಆರಂಭಿಸಿ",
    },
    hi: {
      kicker: "स्टूडियो",
      h1_html: "<em>शिल्प</em> का घर.",
      lede: "हम एक इंटीरियर आर्किटेक्चर स्टूडियो हैं — ड्रॉ करते हैं, मॉडल बनाते हैं, पूरे माहौल गढ़ते हैं। तेरह विधाएँ, एक ही स्तर का काम।",
      link_text: "प्रोजेक्ट शुरू करें",
    },
  },
  "services-disciplines-intro": {
    kn: {
      kicker: "01 — ನಾವು ಏನು ರಚಿಸುತ್ತೇವೆ",
      hint_text: "ಯಾವುದೇ ವಿಭಾಗವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ ನೋಡಿ",
    },
    hi: {
      kicker: "01 — हम क्या रचते हैं",
      hint_text: "किसी भी विधा पर टैप करें",
    },
  },
  "services-materials": {
    kn: {
      kicker: "02 — ಮೆಟೀರಿಯಲ್ ಲೈಬ್ರರಿ",
      h2_html: "ಪ್ರತಿ ಮೇಲ್ಮೈ, <em>ಆಯ್ಕೆ</em>.",
      body: "ಪ್ರತಿ ವಸ್ತುವನ್ನು ದಾಟಿ ಹೋಗಿ — ನಿಮ್ಮ ಮನೆಯಲ್ಲಿರುವಂತೆ ಬೆಳಕು ಹಿಡಿಯುತ್ತದೆ. ಪ್ರತಿ ವಿನಾಯಕ ಇಂಟೀರಿಯರ್ಸ್ ಯೋಜನೆಯ ಹಿಂದಿನ ಪ್ಯಾಲೆಟ್.",
    },
    hi: {
      kicker: "02 — मटेरियल लाइब्रेरी",
      h2_html: "हर सतह, <em>चुनी हुई</em>.",
      body: "हर सामग्री पर घूमें — जैसे आपके घर में, वैसे ही रोशनी पकड़ती है। हर विनायक इंटीरियर्स प्रोजेक्ट के पीछे यही पैलेट।",
    },
  },
  "services-process": {
    kn: {
      kicker: "03 — ಪ್ರಕ್ರಿಯೆ",
      h2_html: "ಕಲ್ಪನೆಯಿಂದ <em>ಹಸ್ತಾಂತರ</em>ವರೆಗೆ.",
      step_1_name: "ವಿಚಾರಣೆ",
      step_2_name: "ಸೈಟ್ ವಿಜಿಟ್",
      step_3_name: "ಬುಕಿಂಗ್ & ಚರ್ಚೆ",
      step_4_name: "ಕಾರ್ಯಾನ್ವಯ",
      step_5_name: "ಹಸ್ತಾಂತರ & ಪರಿಶೀಲನೆ",
      step_1_body:
        "ನೀವು ಕರೆ ಮಾಡುತ್ತೀರಿ. ಫೋನ್‌ನಲ್ಲಿ ಅಂದಾಜು ಅಳತೆ ತೆಗೆದುಕೊಂಡು ಪ್ರಾಥಮಿಕ ಕೋಟೇಶನ್ ಕೊಡುತ್ತೇವೆ — ಮೊದಲ ಕೋಟ್‌ಗೆ ಸೈಟ್ ವಿಜಿಟ್ ಬೇಕಿಲ್ಲ.",
      step_2_body:
        "ಅಂದಾಜು ಸರಿಯಾದರೆ, ನಿಮ್ಮ ಮನೆಗೆ ಬಂದು ನಿಖರ ಅಳತೆ ತೆಗೆದುಕೊಂಡು ವಿವರವಾದ ಅಂತಿಮ ಕೋಟೇಶನ್ ಕೊಡುತ್ತೇವೆ.",
      step_3_body:
        "ನೀವು ದೃಢಪಡಿಸಿದ ನಂತರ ಬುಕಿಂಗ್ ಮೊತ್ತ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ. ನಂತರ ವಸ್ತು, ಫಿನಿಶ್, ಲೇಔಟ್ ಚರ್ಚಿಸಿ ಸ್ಯಾಂಪಲ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತೇವೆ.",
      step_4_body:
        "ನಮ್ಮ ತಂಡ ಕೆಲಸ ಪ್ರಾರಂಭಿಸುತ್ತದೆ. ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಸಮರ್ಪಿತ ಸೈಟ್ ಸೂಪರ್‌ವೈಸರ್ ಗುಣಮಟ್ಟ ಮತ್ತು ಪ್ರಗತಿ ಪರಿಶೀಲಿಸುತ್ತಾರೆ.",
      step_5_body:
        "ಪೂರ್ಣಗೊಂಡ ನಂತರ ಎಲ್ಲಾ ಕೆಲಸವನ್ನು ಮತ್ತೆ ಅಳೆದು, ಬದಲಾವಣೆಗಳನ್ನು ಗಮನಿಸಿ, ಅಂತಿಮ ಹಸ್ತಾಂತರದ ಮೊದಲು ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.",
    },
    hi: {
      kicker: "03 — प्रक्रिया",
      h2_html: "आइडिया से <em>हैंडओवर</em> तक.",
      step_1_name: "पूछताछ",
      step_2_name: "साइट विज़िट",
      step_3_name: "बुकिंग और चर्चा",
      step_4_name: "एक्ज़िक्यूशन",
      step_5_name: "हैंडओवर और जाँच",
      step_1_body:
        "आप कॉल करते हैं। फोन पर अनुमानित नाप लेकर शुरुआती कोटेशन देते हैं — पहले कोट के लिए साइट विज़िट ज़रूरी नहीं।",
      step_2_body:
        "अनुमान सही लगे तो हम आपके घर आते हैं, सही नाप लेते हैं, और विस्तृत अंतिम कोटेशन देते हैं।",
      step_3_body:
        "पुष्टि के बाद बुकिंग राशि लेते हैं। फिर सामग्री, फिनिश, लेआउट पर बात करते हैं और सैंपल दिखाते हैं।",
      step_4_body:
        "हमारी टीम काम शुरू करती है। काम के दिनों में समर्पित साइट सुपरवाइज़र गुणवत्ता और प्रगति जाँचते हैं।",
      step_5_body:
        "पूरा होने के बाद पूरा काम फिर से नापते हैं, बदलाव नोट करते हैं, और अंतिम हैंडओवर से पहले आपको बताते हैं।",
    },
  },
  "services-cta": {
    kn: {
      kicker: "ಆರಂಭ",
      h2_html: "ನಿಮ್ಮ <em>ಜಾಗ</em>ವನ್ನು ತನ್ನಿ.",
      btn_primary_label: "ಸಮಾಲೋಚನೆ ನಿಗದಿ ಮಾಡಿ",
      btn_secondary_label: "ಯೋಜನೆಗಳನ್ನು ನೋಡಿ",
    },
    hi: {
      kicker: "शुरूआत",
      h2_html: "अपनी <em>जगह</em> लेकर आएं.",
      btn_primary_label: "परामर्श बुक करें",
      btn_secondary_label: "प्रोजेक्ट्स देखें",
    },
  },
  "contact-hero": {
    kn: {
      kicker: "ಸಮಾಲೋಚನೆ",
      h1_html: "ಒಂದು <em>ಸಂಭಾಷಣೆ</em> ಆರಂಭಿಸಿ.",
      lede: "ಪ್ರತಿ ವಿನಾಯಕ ಇಂಟೀರಿಯರ್ಸ್ ಮನೆ ಒಂದೇ ರೀತಿ ಆರಂಭವಾಗುತ್ತದೆ — ನಿಧಾನವಾಗಿ, ಒಂದು ಮಾತಿನಿಂದ. ನಿಮ್ಮ ಜಾಗದ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ಹೇಳಿ — ಡ್ರಾಯಿಂಗ್‌ಗಳನ್ನು ನಾವು ತರುತ್ತೇವೆ.",
    },
    hi: {
      kicker: "परामर्श",
      h1_html: "एक <em>बातचीत</em> शुरू करें.",
      lede: "हर विनायक इंटीरियर्स घर एक ही तरह शुरू होता है — धीरे से, एक बातचीत से। अपनी जगह के बारे में थोड़ा बताएं — ड्रॉइंग हम टेबल पर लाएंगे.",
    },
  },
  "contact-consult-aside": {
    kn: {
      kicker: "ನಿಮ್ಮ ಬ್ರೀಫ್",
      aside_note: "ಯಾವುದೇ ಬಾಧ್ಯತೆಯಿಲ್ಲ · ಎರಡು ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಡಿಸೈನರ್ ಉತ್ತರಿಸುತ್ತಾರೆ",
      image_tag_a: "◐ ಸ್ಟುಡಿಯೋ",
      image_tag_b: "ವಿನಾಯಕ ಸಮಾಲೋಚನಾ ಕೊಠಡಿ",
    },
    hi: {
      kicker: "आपका ब्रीफ",
      aside_note: "कोई बाध्यता नहीं · दो कार्य दिवसों में डिज़ाइनर जवाब देते हैं",
      image_tag_a: "◐ स्टूडियो",
      image_tag_b: "विनायक परामर्श कक्ष",
    },
  },
  "contact-locations": {
    kn: {
      kicker: "ಸ್ಟುಡಿಯೋಗಳು",
      h2_html: "ನಾಲ್ಕು ನಗರಗಳು, <em>ಒಂದೇ</em> ಗುಣಮಟ್ಟ.",
      intro:
        "ಯಾವುದೇ ಸ್ಟುಡಿಯೋಗೆ ನೇರವಾಗಿ ಬನ್ನಿ — ಮಾರ್ಗ ತೆರೆಯಲು <strong style=\"color:var(--azure-bright);font-weight:400;\">ದಿಕ್ಕು ಪಡೆಯಿರಿ</strong> ಟ್ಯಾಪ್ ಮಾಡಿ, ಅಥವಾ ಸ್ಟುಡಿಯೋಗೆ ನೇರ ಕರೆ ಮಾಡಿ.",
    },
    hi: {
      kicker: "स्टूडियो",
      h2_html: "चार शहर, <em>एक</em> स्तर.",
      intro:
        "किसी भी स्टूडियो में खुद आएं — रूट खोलने के लिए <strong style=\"color:var(--azure-bright);font-weight:400;\">दिशाएँ लें</strong> पर टैप करें, या स्टूडियो को सीधे कॉल करें।",
    },
  },
  "contact-follow": {
    kn: {
      kicker: "ಫಾಲೋ & ಸಂಪನ್ಮೂಲಗಳು",
      h2_html: "ನೋಡಿ, ಫಾಲೋ ಮಾಡಿ &amp; ನಮ್ಮ ಫಿನಿಶ್‌ಗಳನ್ನು <em>ಬ್ರೌಸ್</em> ಮಾಡಿ.",
      card_yt_title: "YouTube ನಲ್ಲಿ ನಮ್ಮ ಕೆಲಸ ನೋಡಿ",
      card_yt_desc:
        "ವಿನಾಯಕ ಅಲ್ಯೂಮಿನಿಯಂ ಇಂಟೀರಿಯರ್, ಧಾರವಾಡದಿಂದ ಪೂರ್ಣಗೊಂಡ ಇಂಟೀರಿಯರ್‌ಗಳು ಮತ್ತು ವಾಕ್‌ತ್ರೂಗಳು.",
      card_yt_cta: "ವೀಡಿಯೊ ತೆರೆಯಿರಿ →",
      card_fb_title: "ಎಲ್ಲಾ ಡಿಸೈನ್‌ಗಳು — Facebook ನಲ್ಲಿ ಫಾಲೋ ಮಾಡಿ",
      card_fb_desc:
        "ಪೂರ್ಣ ಡಿಸೈನ್ ಲೈಬ್ರರಿ ಬ್ರೌಸ್ ಮಾಡಿ, ಹೊಸ ಯೋಜನೆಗಳು ಮತ್ತು ಫಿನಿಶ್‌ಗಳ ಅಪ್‌ಡೇಟ್ ಪಡೆಯಿರಿ.",
      card_fb_cta: "Facebook ಭೇಟಿ →",
      card_ig_title: "Instagram ನಲ್ಲಿ ಫಾಲೋ ಮಾಡಿ",
      card_ig_desc:
        "ಧಾರವಾಡ ಸ್ಟುಡಿಯೋದಿಂದ ದೈನಂದಿನ ಇಂಟೀರಿಯರ್, ಅಲ್ಯೂಮಿನಿಯಂ ಕೆಲಸ ಮತ್ತು ಲ್ಯಾಮಿನೇಟ್ ಆಯ್ಕೆಗಳು.",
      card_ig_cta: "Instagram ತೆರೆಯಿರಿ →",
      card_flexi_title: "Flexibond ಲ್ಯಾಮಿನೇಟ್ ಕ್ಯಾಟಲಾಗ್",
      card_flexi_desc:
        "ಪೂರ್ಣ 3mm PVC ಲ್ಯಾಮಿನೇಟ್ ಶ್ರೇಣಿ — ವಾರ್ಡ್‌ರೋಬ್, ಕಿಚನ್ ಮತ್ತು ಮಾಡ್ಯುಲರ್ ಇಂಟೀರಿಯರ್‌ಗಳಿಗೆ ಬಣ್ಣ, ಟೆಕ್ಸ್‌ಚರ್ ಮತ್ತು ಸ್ಪೆಕ್.",
      card_flexi_cta: "PDF ಕ್ಯಾಟಲಾಗ್ ತೆರೆಯಿರಿ →",
      card_materials_title: "ಅಲ್ಯೂಮಿನಿಯಂ ಹಾರ್ಡ್‌ವೇರ್ & ಮೆಟೀರಿಯಲ್ ಕ್ಯಾಟಲಾಗ್",
      card_materials_desc:
        "ಪೂರ್ಣ ತಾಂತ್ರಿಕ ವಿವರ — ಫ್ರೇಮ್, ಹಿಂಜ್, ಹ್ಯಾಂಡಲ್, ಬಾಸ್ಕೆಟ್ ಮತ್ತು ಪ್ರತಿ ಬಿಲ್ಡ್‌ನಲ್ಲಿ ಬಳಸುವ ಫಿಟ್ಟಿಂಗ್‌ಗಳು.",
      card_materials_cta: "PDF ಕ್ಯಾಟಲಾಗ್ ತೆರೆಯಿರಿ →",
      card_iso_title: "ISO 9001:2015 ಪ್ರಮಾಣಿತ",
      card_iso_desc:
        "ಗುಣಮಟ್ಟ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆಗೆ ಪ್ರಮಾಣಿತ — ಅಳತೆಯಿಂದ ಹಸ್ತಾಂತರದವರೆಗೆ ಪ್ರತಿ ಯೋಜನೆ ದಾಖಲಿತ, ಆಡಿಟ್ ಪ್ರಕ್ರಿಯೆಗಳನ್ನು ಅನುಸರಿಸುತ್ತದೆ.",
      card_iso_cta: "ಪ್ರಮಾಣಪತ್ರ ನೋಡಿ →",
    },
    hi: {
      kicker: "फ़ॉलो और संसाधन",
      h2_html: "देखें, फ़ॉलो करें और हमारे फ़िनिश <em>ब्राउज़</em> करें.",
      card_yt_title: "YouTube पर हमारा काम देखें",
      card_yt_desc:
        "विनायक एल्युमिनियम इंटीरियर, धारवाड़ से पूरे इंटीरियर और वॉकथ्रू।",
      card_yt_cta: "वीडियो खोलें →",
      card_fb_title: "सभी डिज़ाइन — Facebook पर फ़ॉलो करें",
      card_fb_desc:
        "पूरी डिज़ाइन लाइब्रेरी ब्राउज़ करें और नए प्रोजेक्ट व फ़िनिश की अपडेट पाएँ।",
      card_fb_cta: "Facebook जाएँ →",
      card_ig_title: "Instagram पर फ़ॉलो करें",
      card_ig_desc:
        "धारवाड़ स्टूडियो से रोज़ाना इंटीरियर, एल्युमिनियम काम और लैमिनेट चयन।",
      card_ig_cta: "Instagram खोलें →",
      card_flexi_title: "Flexibond लैमिनेट कैटलॉग",
      card_flexi_desc:
        "पूरी 3mm PVC लैमिनेट रेंज — वार्डरोब, किचन और मॉड्यूलर इंटीरियर के रंग, टेक्सचर और स्पेक।",
      card_flexi_cta: "PDF कैटलॉग खोलें →",
      card_materials_title: "एल्युमिनियम हार्डवेयर और मटेरियल कैटलॉग",
      card_materials_desc:
        "पूरी तकनीकी स्पेसिफिकेशन — फ्रेम, हिंज, हैंडल, बास्केट और हर बिल्ड में इस्तेमाल फिटिंग।",
      card_materials_cta: "PDF कैटलॉग खोलें →",
      card_iso_title: "ISO 9001:2015 प्रमाणित",
      card_iso_desc:
        "क्वालिटी मैनेजमेंट सिस्टम के लिए प्रमाणित — नाप से हैंडओवर तक हर प्रोजेक्ट दस्तावेज़ी, ऑडिटेड प्रक्रियाएँ मानता है।",
      card_iso_cta: "प्रमाणपत्र देखें →",
    },
  },
  "contact-direct": {
    kn: {
      email: "vinayakainteriors308@gmail.com",
      hours: "ಸೋಮ — ಶನಿ · 10–7",
      phone: "+91 80 4000 0000",
      email_label: "ಇಮೇಲ್",
      hours_label: "ಸಮಯ",
      phone_label: "ಟೆಲಿಫೋನ್",
    },
    hi: {
      email: "vinayakainteriors308@gmail.com",
      hours: "सोम — शनि · 10–7",
      phone: "+91 80 4000 0000",
      email_label: "ईमेल",
      hours_label: "समय",
      phone_label: "टेलीफ़ोन",
    },
  },
};

async function main() {
  console.log("=== Projects ===");
  for (const [slug, t] of Object.entries(PROJECTS)) {
    const r = await pool.query(
      `UPDATE projects
       SET title_kn = $1, description_kn = $2, title_hi = $3, description_hi = $4
       WHERE slug = $5
       RETURNING slug, title_kn, title_hi`,
      [t.title_kn, t.description_kn, t.title_hi, t.description_hi, slug],
    );
    console.log(r.rows[0] || { slug, miss: true });
  }

  // Ensure EN title typo stays fixed
  await pool.query(
    `UPDATE projects SET title = 'Penthouse Fourteen'
     WHERE slug = 'penthouse-fourteen' AND title ILIKE '%penhouse%'`,
  );

  console.log("\n=== Content blocks ===");
  for (const [sectionKey, langs] of Object.entries(BLOCKS)) {
    const r = await pool.query(
      `UPDATE content_blocks
       SET fields_kn = $1::jsonb, fields_hi = $2::jsonb
       WHERE section_key = $3
       RETURNING section_key,
         (SELECT count(*) FROM jsonb_object_keys(fields_kn)) AS kn_keys,
         (SELECT count(*) FROM jsonb_object_keys(fields_hi)) AS hi_keys`,
      [JSON.stringify(langs.kn), JSON.stringify(langs.hi), sectionKey],
    );
    console.log(r.rows[0] || { sectionKey, miss: true });
  }

  const empty = await pool.query(`
    SELECT section_key, page
    FROM content_blocks
    WHERE fields_kn = '{}'::jsonb OR fields_hi = '{}'::jsonb
    ORDER BY page, section_key
  `);
  console.log("\nEmpty blocks remaining:", empty.rows.length ? empty.rows : "none");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
