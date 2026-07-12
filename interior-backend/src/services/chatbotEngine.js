/**
 * Rule-based intent matcher — no external LLM.
 * Answers only from chatbotKnowledge.js facts.
 */

const {
  COMPANY,
  DISCIPLINES,
  PROCESS_STEPS,
  STUDIOS,
  FAQ,
  PROJECTS,
} = require("../data/chatbotKnowledge");

const INTENTS = {
  GREETING: "greeting",
  SERVICES: "services_inquiry",
  PRICING: "pricing_inquiry",
  LOCATION: "location_inquiry",
  PROCESS: "process_inquiry",
  CONTACT: "contact_inquiry",
  PROJECTS: "projects_inquiry",
  OFF_TOPIC: "off_topic",
  COMPLEX: "complex_query",
  FALLBACK: "fallback",
};

const MATCH_THRESHOLD = 2;

const BUSINESS_KEYWORDS = [
  "interior",
  "interiors",
  "aluminium",
  "aluminum",
  "kitchen",
  "wardrobe",
  "modular",
  "bhk",
  "bedroom",
  "living",
  "studio",
  "vinayak",
  "design",
  "furniture",
  "partition",
  "pantry",
  "showcase",
  "tv unit",
  "loft",
  "quote",
  "quotation",
  "budget",
  "price",
  "cost",
  "timeline",
  "weeks",
  "process",
  "enquiry",
  "site visit",
  "handover",
  "booking",
  "execution",
  "karnataka",
  "dharwad",
  "vijayapura",
  "kalaburagi",
  "hospet",
  "hubli",
  "hubballi",
  "consultation",
  "fit-out",
  "fitout",
  "laminate",
  "material",
  "office",
  "address",
  "phone",
  "whatsapp",
  "email",
  "contact",
  "service",
  "services",
  "project",
  "projects",
  "portfolio",
  "home",
  "house",
  "villa",
  "apartment",
];

const OFF_TOPIC_KEYWORDS = [
  "weather",
  "temperature",
  "forecast",
  "cricket",
  "football",
  "ipl",
  "movie",
  "bollywood",
  "recipe",
  "cooking",
  "politics",
  "election",
  "stock",
  "crypto",
  "bitcoin",
  "joke",
  "meme",
  "horoscope",
  "astrology",
  "sports",
  "news today",
  "who won",
  "chatgpt",
  "openai",
];

const COMPLEX_KEYWORDS = [
  "measurement",
  "measurements",
  "exact quote",
  "exact quotation",
  "exact price",
  "exact cost",
  "site visit needed",
  "need a site visit",
  "specific dimensions",
  "dimension",
  "dimensions",
  "custom design",
  "customise",
  "customize",
  "bespoke",
  "floor plan",
  "floorplan",
  "sqft",
  "square feet",
  "sq ft",
  "detailed quote",
  "final quotation",
  "boq",
  "bill of quantities",
];

const INTENT_TRIGGERS = {
  [INTENTS.GREETING]: {
    phrases: [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "namaste",
      "howdy",
    ],
    weight: 3,
  },
  [INTENTS.SERVICES]: {
    phrases: [
      "services",
      "what do you offer",
      "what do you do",
      "disciplines",
      "packages",
      "aluminium",
      "aluminum",
      "modular kitchen",
      "living room",
      "tv unit",
      "partition",
      "showcase",
      "dressing",
      "pantry",
      "loft",
      "1 bhk",
      "2 bhk",
      "3 bhk",
      "4 bhk",
      "interiors",
      "interior design",
    ],
    weight: 2,
  },
  [INTENTS.PRICING]: {
    phrases: [
      "price",
      "pricing",
      "cost",
      "budget",
      "how much",
      "rate",
      "rates",
      "₹",
      "rs ",
      "rupee",
      "expensive",
      "affordable",
      "estimate",
      "quotation",
      "quote",
    ],
    weight: 2,
  },
  [INTENTS.LOCATION]: {
    phrases: [
      "location",
      "locations",
      "studio",
      "studios",
      "address",
      "where are you",
      "branch",
      "branches",
      "office",
      "offices",
      "near me",
      "vijayapura",
      "dharwad",
      "kalaburagi",
      "hospet",
      "hubli",
      "hubballi",
      "hours",
      "timing",
      "timings",
      "open",
      "phone number",
      "call",
    ],
    weight: 2,
  },
  [INTENTS.PROCESS]: {
    phrases: [
      "process",
      "how it works",
      "how do you work",
      "steps",
      "procedure",
      "enquiry",
      "site visit",
      "booking",
      "execution",
      "handover",
      "workflow",
      "what happens next",
      "journey",
    ],
    weight: 2,
  },
  [INTENTS.CONTACT]: {
    phrases: [
      "contact",
      "email",
      "whatsapp",
      "reach you",
      "get in touch",
      "book a consultation",
      "consultation",
      "talk to someone",
      "speak to",
    ],
    weight: 2,
  },
  [INTENTS.PROJECTS]: {
    phrases: [
      "project",
      "projects",
      "portfolio",
      "your work",
      "completed work",
      "case study",
      "penthouse",
      "basalt",
      "linen",
      "selected work",
      "compositions",
      "about your projects",
      "say about your project",
    ],
    weight: 2,
  },
};

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s₹.+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreIntent(normalized, phrases, weight) {
  let score = 0;
  const hits = [];
  for (const phrase of phrases) {
    if (normalized === phrase || normalized.includes(phrase)) {
      score += weight;
      hits.push(phrase);
    }
  }
  return { score, hits };
}

function findDiscipline(normalized) {
  for (const d of DISCIPLINES) {
    for (const kw of d.keywords) {
      if (normalized.includes(kw)) return d;
    }
    if (normalized.includes(normalize(d.title))) return d;
  }
  return null;
}

function findStudio(normalized) {
  for (const s of STUDIOS) {
    for (const kw of s.keywords) {
      if (normalized.includes(kw)) return s;
    }
  }
  return null;
}

function hasAny(normalized, list) {
  return list.some((kw) => normalized.includes(kw));
}

function link(label, href) {
  return "[" + label + "](" + href + ")";
}

function formatDisciplineLine(d) {
  return `• ${d.title} — budget ${d.budget_range}, timeline ${d.timeline} (${d.scope})`;
}

function replyServices(normalized) {
  const d = findDiscipline(normalized);
  if (d) {
    return (
      `${d.title} is one of our core offerings.\n\n` +
      `• Typical budget: ${d.budget_range}\n` +
      `• Timeline: ${d.timeline}\n` +
      `• Scope: ${d.scope}\n\n` +
      `These are published ranges from our Studio page — final numbers depend on materials and layout. ` +
      `Browse every discipline on ${link("Studio / Services", "Services.html")}, ` +
      `or ${link("book a consultation", "Contact.html")} for a tailored quote.`
    );
  }
  const lines = DISCIPLINES.map(formatDisciplineLine).join("\n");
  return (
    `We compose interiors across ${COMPANY.serviceArea} — from full BHK fit-outs to modular kitchens and aluminium units.\n\n` +
    `${lines}\n\n` +
    `Ask about a specific service (e.g. “2 BHK cost” or “modular kitchen timeline”), ` +
    `or open ${link("Studio / Services", "Services.html")} to explore the full list.`
  );
}

function replyPricing(normalized) {
  const d = findDiscipline(normalized);
  if (d) {
    return (
      `For ${d.title}, our published budget range is ${d.budget_range}, with a typical timeline of ${d.timeline}.\n\n` +
      `Final pricing depends on materials, layout, and a site visit. During Enquiry we can often give an initial phone quotation without visiting first.\n\n` +
      `See all ranges on ${link("Studio / Services", "Services.html")}, ` +
      `or ${link("start a consultation", "Contact.html")} when you’re ready.`
    );
  }
  const summary = DISCIPLINES.slice(0, 7)
    .map((x) => `• ${x.title}: ${x.budget_range}`)
    .join("\n");
  return (
    `Here are published budget ranges from our Studio page:\n\n${summary}\n\n` +
    `Ask “how much for [service]” for a specific range, ` +
    `browse ${link("Studio / Services", "Services.html")}, ` +
    `or ${link("contact us", "Contact.html")} for an initial quotation.`
  );
}

function replyLocation(normalized) {
  const s = findStudio(normalized);
  if (s) {
    return (
      `Our ${s.city} studio:\n\n` +
      `• Address: ${s.address}\n` +
      `• Hours: ${s.hours}\n` +
      `• Phone: ${s.phone_display}\n\n` +
      `Directions and WhatsApp are on ${link("Contact — The Studios", "Contact.html#locations")}.`
    );
  }
  const blocks = STUDIOS.map(
    (st) =>
      `• ${st.city}: ${st.address}\n  Hours ${st.hours} · ${st.phone_display}`,
  ).join("\n\n");
  return (
    `We have four studios across ${COMPANY.serviceArea}:\n\n${blocks}\n\n` +
    `Ask for a city (e.g. “Dharwad address”), or open ${link("Contact — The Studios", "Contact.html#locations")} for maps and WhatsApp.`
  );
}

function replyProcess() {
  const lines = PROCESS_STEPS.map(
    (s) =>
      `${String(s.step).padStart(2, "0")}. ${s.name}\n   ${s.body}`,
  ).join("\n\n");
  return (
    `Every Vinayak project follows five clear steps:\n\n${lines}\n\n` +
    `Read the full process on ${link("Studio — How we work", "Services.html#process")}, ` +
    `or ${link("begin a consultation", "Contact.html")}.`
  );
}

function replyContact() {
  return (
    `You can reach Vinayak Aluminium Interiors a few ways:\n\n` +
    `• Email: ${COMPANY.email}\n` +
    `• Studios in ${COMPANY.studiosSummary}\n` +
    `• Online consultation form on our Contact page\n\n` +
    `${link("Open Contact", "Contact.html")} · ${link("Studio locations", "Contact.html#locations")} · ${link("WhatsApp & catalogues", "Contact.html#follow")}`
  );
}

function replyProjects() {
  const lines = (PROJECTS || [])
    .map(
      (p) =>
        `• ${p.title} (${p.location})\n  ${p.blurb}\n  Materials: ${p.materials}`,
    )
    .join("\n\n");
  return (
    `Here are featured compositions from our portfolio:\n\n${lines}\n\n` +
    `Explore the full journey, materials, and before/after on ${link("Projects", "Projects.html")}. ` +
    `If a space resonates, ${link("book a consultation", "Contact.html")} and we’ll tailor a brief to your home.`
  );
}

function replyGreeting() {
  return (
    `Hello — I’m the Vinayak Interiors studio assistant.\n\n` +
    `I can explain our services, published budgets, studio locations, and our five-step process — using only what’s on this site.\n\n` +
    `Try a suggestion below, or ask in your own words. Useful pages: ${link("Projects", "Projects.html")}, ${link("Studio", "Services.html")}, ${link("Contact", "Contact.html")}.`
  );
}

function replyOffTopic() {
  return (
    "I can only help with questions about Vinayak Aluminium Interiors and our interior design services. " +
    "For other topics I’m not able to help — is there something about our services, pricing, or studios I can answer?\n\n" +
    `${link("Studio / Services", "Services.html")} · ${link("Contact", "Contact.html")}`
  );
}

function replyComplex() {
  return (
    "That’s something our team needs to look at directly — exact measurements, custom layouts, and final quotations need a designer’s eye.\n\n" +
    "Share your name and phone number here, or " +
    `${link("contact us on the consultation page", "Contact.html")}, ` +
    "and we’ll get back to you with exact details."
  );
}

function replyFallback() {
  return (
    `I can help with ${COMPANY.shortName} services, pricing ranges, studio locations, our 5-step process, or contact details.\n\n` +
    `Try “What services do you offer?”, “How much for a 2 BHK?”, or “Where is your Dharwad studio?”\n\n` +
    `${link("Projects", "Projects.html")} · ${link("Studio", "Services.html")} · ${link("Contact", "Contact.html")}`
  );
}

function classifyIntent(message) {
  const normalized = normalize(message);
  if (!normalized) {
    return { intent: INTENTS.GREETING, score: 0, scores: {} };
  }

  const scores = {};
  let bestIntent = INTENTS.FALLBACK;
  let bestScore = 0;

  for (const [intent, cfg] of Object.entries(INTENT_TRIGGERS)) {
    const { score } = scoreIntent(normalized, cfg.phrases, cfg.weight);
    scores[intent] = score;
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  const complexHit = hasAny(normalized, COMPLEX_KEYWORDS);
  const offTopicHit = hasAny(normalized, OFF_TOPIC_KEYWORDS);
  const businessHit = hasAny(normalized, BUSINESS_KEYWORDS);

  if (complexHit) {
    return { intent: INTENTS.COMPLEX, score: bestScore + 5, scores };
  }

  if (offTopicHit && !businessHit) {
    return { intent: INTENTS.OFF_TOPIC, score: 5, scores };
  }

  if (!businessHit && bestScore < MATCH_THRESHOLD && normalized.split(" ").length > 3) {
    return { intent: INTENTS.OFF_TOPIC, score: bestScore, scores };
  }

  if (bestScore < MATCH_THRESHOLD) {
    if (findDiscipline(normalized)) {
      return { intent: INTENTS.SERVICES, score: MATCH_THRESHOLD, scores };
    }
    return { intent: INTENTS.FALLBACK, score: bestScore, scores };
  }

  // Pricing + a service name → pricing wins if pricing scored
  if (
    scores[INTENTS.PRICING] >= MATCH_THRESHOLD &&
    (findDiscipline(normalized) || scores[INTENTS.SERVICES] > 0)
  ) {
    return { intent: INTENTS.PRICING, score: scores[INTENTS.PRICING], scores };
  }

  return { intent: bestIntent, score: bestScore, scores };
}

/**
 * Parse a follow-up contact message: name + phone (and optional email).
 */
function extractContact(message) {
  const text = String(message || "").trim();
  const phoneMatch = text.match(
    /(?:\+?91[\s-]*)?[6-9]\d{9}|\d{3}[\s-]?\d{3}[\s-]?\d{4}/,
  );
  const emailMatch = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );

  let name = null;
  const nameMatch = text.match(
    /(?:(?:i am|i'm|my name is|name[:\s]+)\s*)([A-Za-z][A-Za-z\s.'-]{1,60})/i,
  );
  if (nameMatch) {
    name = nameMatch[1].replace(/[^A-Za-z\s.'-]/g, " ").trim();
  } else {
    const beforePhone = phoneMatch
      ? text.slice(0, phoneMatch.index).replace(/[,|]/g, " ").trim()
      : "";
    const words = beforePhone.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 4 && /^[A-Za-z]/.test(words[0])) {
      name = words.join(" ").replace(/[^A-Za-z\s.'-]/g, "").trim();
    }
  }

  if (!phoneMatch && !emailMatch) return null;

  return {
    name: name || "Chat visitor",
    phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, "") : null,
    email: emailMatch ? emailMatch[0] : null,
  };
}

function buildReply(intent, message) {
  const normalized = normalize(message);
  switch (intent) {
    case INTENTS.GREETING:
      return replyGreeting();
    case INTENTS.SERVICES:
      return replyServices(normalized);
    case INTENTS.PRICING:
      return replyPricing(normalized);
    case INTENTS.LOCATION:
      return replyLocation(normalized);
    case INTENTS.PROCESS:
      return replyProcess();
    case INTENTS.CONTACT:
      return replyContact();
    case INTENTS.PROJECTS:
      return replyProjects();
    case INTENTS.OFF_TOPIC:
      return replyOffTopic();
    case INTENTS.COMPLEX:
      return replyComplex();
    default:
      return replyFallback();
  }
}

/**
 * @param {string} message
 * @param {{ awaitingContact?: boolean, originalQuestion?: string }} [session]
 */
function processMessage(message, session = {}) {
  if (session.awaitingContact) {
    const contact = extractContact(message);
    if (contact) {
      return {
        reply:
          `Thank you${contact.name && contact.name !== "Chat visitor" ? `, ${contact.name}` : ""}. ` +
          `We've noted your details and our team will follow up on: “${session.originalQuestion || "your enquiry"}”. ` +
          `You can also write to ${COMPANY.email} anytime.`,
        intent: "contact_capture",
        needsContact: false,
        lead: {
          ...contact,
          originalQuestion: session.originalQuestion || null,
        },
        session: { awaitingContact: false, originalQuestion: null },
      };
    }
    return {
      reply:
        "Please share your name and phone number (e.g. “Rahul, 9876543210”), " +
        `or use ${COMPANY.contactPage} — then our team can help with exact details.`,
      intent: INTENTS.COMPLEX,
      needsContact: true,
      lead: null,
      session: {
        awaitingContact: true,
        originalQuestion: session.originalQuestion || null,
      },
    };
  }

  const { intent, score, scores } = classifyIntent(message);
  const needsContact = intent === INTENTS.COMPLEX;
  const reply = buildReply(intent, message);

  return {
    reply,
    intent,
    needsContact,
    lead: null,
    score,
    scores,
    session: needsContact
      ? { awaitingContact: true, originalQuestion: String(message || "").trim() }
      : { awaitingContact: false, originalQuestion: null },
  };
}

module.exports = {
  INTENTS,
  processMessage,
  classifyIntent,
  extractContact,
  MATCH_THRESHOLD,
};
