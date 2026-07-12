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
      kicker: "Vinayak Aluminium Interiors — Est. MMXIV",
      h1_line1: "We compose",
      h1_line2_html: "<em>atmosphere</em>, not rooms.",
      lede:
        "An interior architecture studio shaping light, material and proportion across Vijayapura, Dharwad, Kalaburagi & Hospet — from a single kitchen to a complete residence.",
      meta_coords_html: "KARNATAKA<br>INTERIOR ARCHITECTURE",
      stat_completed_label: "Completed",
      stat_completed_value: "240+",
      stat_cities_label: "Cities",
      stat_cities_value: "04",
      stat_since_label: "Since",
      stat_since_value: "MMXIV",
      hero_tag_b: "Luxury living room — Karnataka",
      plate_mark: "PLATE 01 · ƒ/1.8",
    },
    images: [
      {
        key: "hero",
        url: "/assets/images/img-hero.jpg",
        label: "Hero photo (desktop)",
        recommended: "1920x1080, landscape",
      },
      {
        key: "hero-mobile",
        url: "/assets/images/img-hero-mobile.jpg",
        label: "Hero photo (mobile)",
        recommended: "1080x1920, portrait",
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
      reach_label: "Or reach us directly",
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
      stat_since_value: "MMXIV",
    },
    images: [],
  },
  {
    page: "projects",
    section_key: "projects-journey-intro",
    section_label: "Projects — Journey intro",
    fields: {
      kicker: "Project Journeys",
      h2_html:
        'Three homes, <span class="brass">told</span> left to right.',
      body:
        "As you scroll, the gallery moves horizontally — each home a chapter. Keep going to reach the transformations.",
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
    images: [
      {
        key: "ba-after",
        url: "/assets/images/img-ba-after.jpg",
        label: "After photo",
        recommended: "1920x1080, landscape",
      },
      {
        key: "ba-before",
        url: "/assets/images/img-ba-before.jpg",
        label: "Before photo",
        recommended: "1920x1080, landscape",
      },
    ],
  },
  {
    page: "projects",
    section_key: "projects-cta",
    section_label: "Projects — CTA band",
    fields: {
      kicker: "Your project next",
      h2_html: 'Begin a <span class="brass">composition</span>.',
      btn_primary_label: "Book a consultation",
      btn_secondary_label: "Explore the studio",
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
    section_label: "Services — Process",
    fields: {
      kicker: "03 — The Process",
      h2_html: "From idea to <em>handover</em>.",
      step_1_name: "Enquiry",
      step_1_body:
        "You call us. We take approximate measurements over the phone and give you an initial quotation — no site visit needed for the first quote.",
      step_2_name: "Site Visit",
      step_2_body:
        "If you're happy with the estimate, we visit your home, take exact measurements, and give you a final detailed quotation.",
      step_3_name: "Booking & Discussion",
      step_3_body:
        "Once you confirm, we collect a booking amount. We then sit with you to discuss the full project — materials, finishes, layout — and show you samples.",
      step_4_name: "Execution",
      step_4_body:
        "Our team begins work. A dedicated site supervisor visits regularly during working days to check quality and progress.",
      step_5_name: "Handover & Check",
      step_5_body:
        "After completion, we re-measure the entire work, note any changes or adjustments, and inform you before final handover.",
    },
    images: [
      {
        key: "step-1",
        url: "/assets/images/img-proc-concept.jpg",
        label: "Step 1 — Enquiry photo",
        recommended: "1200x900, landscape",
      },
      {
        key: "step-2",
        url: "/assets/images/img-proc-design.jpg",
        label: "Step 2 — Site visit photo",
        recommended: "1200x900, landscape",
      },
      {
        key: "step-3",
        url: "/assets/images/img-proc-visualise.jpg",
        label: "Step 3 — Booking photo",
        recommended: "1200x900, landscape",
      },
      {
        key: "step-4",
        url: "/assets/images/img-proc-execute.jpg",
        label: "Step 4 — Execution photo",
        recommended: "1200x900, landscape",
      },
      {
        key: "step-5",
        url: "/assets/images/img-proc-reveal.jpg",
        label: "Step 5 — Handover photo",
        recommended: "1200x900, landscape",
      },
    ],
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
      image_tag_a: "◐ STUDIO",
      image_tag_b: "Vinayak consultation room",
    },
    images: [
      {
        key: "sidebar",
        url: "/assets/images/img-contact.jpg",
        label: "Consultation room photo",
        recommended: "1200x1600, portrait",
      },
    ],
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
  {
    page: "contact",
    section_key: "contact-follow",
    section_label: "Contact — Follow & resources",
    fields: {
      kicker: "Follow & Resources",
      h2_html: "Watch, follow &amp; <em>browse</em> our finishes.",
      card_yt_title: "Watch our work on YouTube",
      card_yt_desc:
        "See completed interiors and walkthroughs from Vinayak Aluminium Interior, Dharwad.",
      card_yt_cta: "Open video →",
      card_fb_title: "All designs — follow on Facebook",
      card_fb_desc:
        "Browse our full design library and stay updated with new projects and finishes.",
      card_fb_cta: "Visit Facebook →",
      card_ig_title: "Follow us on Instagram",
      card_ig_desc:
        "Daily interiors, aluminium work and laminate selections from our Dharwad studio.",
      card_ig_cta: "Open Instagram →",
      card_wa_title: "Message us on WhatsApp",
      card_wa_desc:
        "Start a conversation with our Dharwad studio — or use The Studios section above for your nearest city line.",
      card_wa_cta: "Open WhatsApp →",
      card_flexi_title: "Flexibond laminate catalog",
      card_flexi_desc:
        "Full 3mm PVC laminate range — colours, textures and specs for wardrobes, kitchens and modular interiors.",
      card_flexi_cta: "Open PDF catalog →",
      card_materials_title: "Aluminium Hardware & Materials Catalog",
      card_materials_desc:
        "Complete technical specification — frames, hinges, handles, baskets, and fittings used across every build.",
      card_materials_cta: "Open PDF catalog →",
      card_iso_title: "ISO 9001:2015 Certified",
      card_iso_desc:
        "Certified for Quality Management Systems — every project follows documented, audited processes from measurement to handover.",
      card_iso_cta: "VIEW CERTIFICATE →",
    },
    images: [],
  },
  {
    page: "contact",
    section_key: "contact-direct",
    section_label: "Contact — Direct contact strip",
    fields: {
      email_label: "Email",
      email: "vinayakainteriors308@gmail.com",
      phone_label: "Telephone",
      phone: "+91 80 4000 0000",
      hours_label: "Hours",
      hours: "Mon — Sat · 10–7",
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

function cloneDefaultBlock(sectionKey) {
  const block = DEFAULTS_BY_SECTION_KEY[sectionKey];
  if (!block) return null;

  return {
    page: block.page,
    section_key: block.section_key,
    section_label: block.section_label,
    fields: JSON.parse(JSON.stringify(block.fields || {})),
    images: JSON.parse(JSON.stringify(block.images || [])),
  };
}

function getDefaultBlock(sectionKey) {
  return cloneDefaultBlock(sectionKey);
}

module.exports = {
  DASHBOARD_CONTENT_BLOCKS,
  PROJECTS_CONTENT_BLOCKS,
  SERVICES_CONTENT_BLOCKS,
  CONTACT_CONTENT_BLOCKS,
  ALL_CONTENT_BLOCKS,
  DEFAULTS_BY_SECTION_KEY,
  getDefaultBlock,
  cloneDefaultBlock,
};
