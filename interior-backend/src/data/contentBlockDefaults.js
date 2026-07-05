const MANIFESTO_STATEMENT_HTML = [
  '<span class="w">A</span> <span class="w">home</span> <span class="w">is</span> <span class="w">not</span> <span class="w">decorated.</span>',
  '<span class="w azure">It</span> <span class="w azure">is</span> <span class="w azure"><em>composed</em></span> <span class="w">—</span>',
  '<span class="w">light,</span> <span class="w">proportion</span> <span class="w">and</span> <span class="w">material</span>',
  '<span class="w">arranged</span> <span class="w">until</span> <span class="w">a</span> <span class="w">space</span>',
  '<span class="w">finally</span> <span class="w">sounds</span> <span class="w">like</span> <span class="w">you.</span>',
].join(" ");

const DASHBOARD_CONTENT_BLOCKS = [
  {
    page: "dashboard",
    section_key: "dashboard-hero",
    section_label: "Dashboard — Hero banner",
    fields: {
      kicker: "Vinayak Aluminium Interiors — Est. MMXXVI",
      h1_line1: "We compose",
      h1_line2_html: "<em>atmosphere</em>, not rooms.",
      lede:
        "An interior architecture studio shaping light, material and proportion across Bangalore, Hubli, Dharwad & Hospet — from a single kitchen to a complete residence.",
      meta_coords_html: "N 12.97° · E 77.59°<br>INTERIOR ARCHITECTURE",
      stat_completed_label: "Completed",
      stat_completed_value: "240+",
      stat_cities_label: "Cities",
      stat_cities_value: "04",
      stat_since_label: "Since",
      stat_since_value: "MMXXI",
      hero_tag_b: "Luxury living room — Bangalore",
      plate_mark: "PLATE 01 · ƒ/1.8",
    },
    images: [
      {
        key: "hero",
        url: "/assets/images/img-hero.jpg",
        label: "Hero photo",
        recommended: "1920x1080, landscape",
      },
    ],
  },
  {
    page: "dashboard",
    section_key: "dashboard-manifesto",
    section_label: "Dashboard — Manifesto",
    fields: {
      kicker: "01 — The Philosophy",
      statement_html: MANIFESTO_STATEMENT_HTML,
      foot_body:
        "We treat every brief as a work of architecture in miniature — drawn, modelled and pressure-tested before a single wall is touched.",
      foot_link_text: "The studio approach",
    },
    images: [],
  },
  {
    page: "dashboard",
    section_key: "dashboard-materials-teaser",
    section_label: "Dashboard — Materials teaser",
    fields: {
      kicker: "04 — The Material Library",
      h2_html: "Touch the <em>palette</em>.",
      link_text: "Explore materials",
      mat_1_name: "Marble",
      mat_1_subtitle: "Carrara · Statuario",
      mat_2_name: "Oak",
      mat_2_subtitle: "Smoked · Rift",
      mat_3_name: "Brass",
      mat_3_subtitle: "Antique · Brushed",
      mat_4_name: "Stone",
      mat_4_subtitle: "Basalt · Travertine",
      mat_5_name: "Linen",
      mat_5_subtitle: "Belgian · Raw",
    },
    images: [],
  },
  {
    page: "dashboard",
    section_key: "dashboard-process-mini",
    section_label: "Dashboard — Process mini",
    fields: {
      kicker: "05 — How We Work",
      h2_html: 'Five movements, <span class="brass">one</span> home.',
      link_text: "See the full process",
      step_1_title: "Concept",
      step_1_body: "We listen, then sketch the idea of the space before its shape.",
      step_2_title: "Design",
      step_2_body:
        "Drawings, layouts and material boards resolved to the millimetre.",
      step_3_title: "Visualise",
      step_3_body: "Photoreal renders let you walk the home before it is built.",
      step_4_title: "Execute",
      step_4_body: "Our craftsmen build to drawing, supervised end to end.",
      step_5_title: "Reveal",
      step_5_body: "We hand over a finished, styled, photograph-ready home.",
    },
    images: [],
  },
  {
    page: "dashboard",
    section_key: "dashboard-cta-band",
    section_label: "Dashboard — CTA band",
    fields: {
      kicker: "Begin",
      h2_html: "Let's <em>compose</em><br>your space.",
      lede:
        "A private consultation begins every Vinayak Interiors project. Tell us about your home — we'll bring the drawings.",
      btn_primary_label: "Book a consultation",
      btn_secondary_label: "View projects",
    },
    images: [],
  },
];

const PROJECTS_CONTENT_BLOCKS = [
  {
    page: "projects",
    section_key: "projects-hero",
    section_label: "Projects — Page header",
    fields: {
      kicker: "Selected Work — 2021 / 2026",
      h1_html: "The <em>portfolio</em>.",
      lede:
        "Each project is a composition — a brief resolved through light, proportion and material. Scroll through three recent homes, then pull the divider to watch one transform.",
      stat_completed_label: "Completed",
      stat_completed_value: "240+",
      stat_cities_label: "Cities",
      stat_cities_value: "04",
      stat_since_label: "Since",
      stat_since_value: "MMXXI",
    },
    images: [],
  },
  {
    page: "projects",
    section_key: "projects-transformation",
    section_label: "Projects — Before / after",
    fields: {
      kicker: "The Transformation",
      h2_html: "Before, and <em>after</em>.",
      caption:
        "Penthouse Fourteen — the living room, as found and as composed. Pull the divider.",
    },
    images: [],
  },
];

const SERVICES_CONTENT_BLOCKS = [
  {
    page: "services",
    section_key: "services-hero",
    section_label: "Services — Page header",
    fields: {
      kicker: "The Studio",
      h1_html: "A house of <em>craft</em>.",
      lede:
        "We are an interior architecture studio — drawing, modelling and building complete environments. Thirteen disciplines, one standard of resolution.",
      link_text: "Start a project",
    },
    images: [],
  },
  {
    page: "services",
    section_key: "services-disciplines-intro",
    section_label: "Services — Disciplines intro",
    fields: {
      kicker: "01 — What We Compose",
      hint_text: "Tap any discipline to explore",
    },
    images: [],
  },
  {
    page: "services",
    section_key: "services-materials",
    section_label: "Services — Material library",
    fields: {
      kicker: "02 — The Material Library",
      h2_html: "Every surface, <em>chosen</em>.",
      body:
        "Move across each material — light catches it as it would in your home. The palette behind every Vinayak Interiors project.",
    },
    images: [],
  },
  {
    page: "services",
    section_key: "services-process",
    section_label: "Services — Process header",
    fields: {
      kicker: "03 — The Process",
      h2_html: "From idea to <em>handover</em>.",
    },
    images: [],
  },
  {
    page: "services",
    section_key: "services-cta",
    section_label: "Services — CTA band",
    fields: {
      kicker: "Begin",
      h2_html: "Bring us your <em>space</em>.",
      btn_primary_label: "Book a consultation",
      btn_secondary_label: "View projects",
    },
    images: [],
  },
];

const CONTACT_CONTENT_BLOCKS = [
  {
    page: "contact",
    section_key: "contact-hero",
    section_label: "Contact — Page header",
    fields: {
      kicker: "The Consultation",
      h1_html: "Begin a <em>conversation</em>.",
      lede:
        "Every Vinayak Interiors home starts the same way — quietly, over a conversation. Tell us a little about your space and we'll bring the drawings to the table.",
    },
    images: [],
  },
  {
    page: "contact",
    section_key: "contact-consult-aside",
    section_label: "Contact — Consultation sidebar",
    fields: {
      kicker: "Your Brief",
      aside_note: "No obligation · A designer replies within two working days",
    },
    images: [],
  },
  {
    page: "contact",
    section_key: "contact-locations",
    section_label: "Contact — Studios section",
    fields: {
      kicker: "The Studios",
      h2_html: "Four cities, <em>one</em> standard.",
      intro:
        "Visit any studio in person — tap Get directions to open the route in Google Maps, or call the studio directly.",
    },
    images: [],
  },
];

const ALL_CONTENT_BLOCKS = [
  ...DASHBOARD_CONTENT_BLOCKS,
  ...PROJECTS_CONTENT_BLOCKS,
  ...SERVICES_CONTENT_BLOCKS,
  ...CONTACT_CONTENT_BLOCKS,
];

const DEFAULTS_BY_SECTION_KEY = ALL_CONTENT_BLOCKS.reduce((acc, block) => {
  acc[block.section_key] = block;
  return acc;
}, {});

function getDefaultBlock(sectionKey) {
  return DEFAULTS_BY_SECTION_KEY[sectionKey] || null;
}

module.exports = {
  DASHBOARD_CONTENT_BLOCKS,
  PROJECTS_CONTENT_BLOCKS,
  SERVICES_CONTENT_BLOCKS,
  CONTACT_CONTENT_BLOCKS,
  ALL_CONTENT_BLOCKS,
  DEFAULTS_BY_SECTION_KEY,
  getDefaultBlock,
};
