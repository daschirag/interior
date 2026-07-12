/**
 * Chatbot knowledge base — facts only from live site / seed content.
 * Do not invent budgets, timelines, addresses, or phones here.
 */

const COMPANY = {
  name: "Vinayak Aluminium Interiors",
  shortName: "Vinayak Interiors",
  foundedYear: 2014,
  foundedRoman: "MMXIV",
  serviceArea: "Karnataka",
  specialization:
    "Interior architecture and aluminium interiors — modular kitchens, living spaces, full BHK fit-outs, and custom aluminium units.",
  email: "vinayakainteriors308@gmail.com",
  contactPage: "Contact.html",
  studiosSummary: "Vijayapura, Dharwad, Kalaburagi, and Hospet",
};

/** Mirrors disciplines seeded from public/Services.html */
const DISCIPLINES = [
  {
    slug: "1-bhk-interiors",
    title: "1 BHK Interiors",
    budget_range: "₹1.5L – ₹2L",
    timeline: "6 – 10 weeks",
    scope: "Full fit-out",
    keywords: ["1bhk", "1 bhk", "one bhk", "1-bedroom", "1 bedroom"],
  },
  {
    slug: "2-bhk-interiors",
    title: "2 BHK Interiors",
    budget_range: "₹2.5L – ₹3L",
    timeline: "10 – 14 weeks",
    scope: "Complete interiors",
    keywords: ["2bhk", "2 bhk", "two bhk", "2-bedroom", "2 bedroom"],
  },
  {
    slug: "3-bhk-interiors",
    title: "3 BHK Interiors",
    budget_range: "₹3.5L",
    timeline: "14 – 20 weeks",
    scope: "Full architecture",
    keywords: ["3bhk", "3 bhk", "three bhk", "3-bedroom", "3 bedroom"],
  },
  {
    slug: "4-bhk-interiors",
    title: "4 BHK Interiors",
    budget_range: "₹4.5L",
    timeline: "20 – 32 weeks",
    scope: "Signature project",
    keywords: ["4bhk", "4 bhk", "four bhk", "4-bedroom", "4 bedroom"],
  },
  {
    slug: "modular-kitchen",
    title: "Modular Kitchen",
    budget_range: "₹3.5L – ₹12L",
    timeline: "4 – 7 weeks",
    scope: "Full kitchen",
    keywords: ["kitchen", "modular kitchen", "modular"],
  },
  {
    slug: "luxury-living-rooms",
    title: "Luxury Living Rooms",
    budget_range: "₹5L – ₹20L",
    timeline: "6 – 10 weeks",
    scope: "Signature room",
    keywords: ["living room", "living rooms", "lounge", "drawing room"],
  },
  {
    slug: "aluminium-interiors",
    title: "Aluminium Interiors",
    budget_range: "₹2.5L – ₹8L",
    timeline: "3 – 6 weeks",
    scope: "Modular units",
    keywords: ["aluminium interiors", "aluminum interiors", "aluminium work"],
  },
  {
    slug: "aluminium-tv-unit",
    title: "Aluminium TV Unit",
    budget_range: "₹45K – ₹2.5L",
    timeline: "1 – 3 weeks",
    scope: "Single unit",
    keywords: ["tv unit", "tv cabinet", "television unit"],
  },
  {
    slug: "aluminium-showcase",
    title: "Aluminium Showcase",
    budget_range: "₹60K – ₹3L",
    timeline: "2 – 4 weeks",
    scope: "Display unit",
    keywords: ["showcase", "display unit", "display cabinet"],
  },
  {
    slug: "aluminium-dressing-table",
    title: "Aluminium Dressing Table",
    budget_range: "₹35K – ₹1.8L",
    timeline: "1 – 3 weeks",
    scope: "Bedroom unit",
    keywords: ["dressing table", "dresser", "dressing"],
  },
  {
    slug: "aluminium-pantry-unit",
    title: "Aluminium Pantry Unit",
    budget_range: "₹50K – ₹2.2L",
    timeline: "2 – 4 weeks",
    scope: "Pantry fit-out",
    keywords: ["pantry", "pantry unit"],
  },
  {
    slug: "aluminium-partition",
    title: "Aluminium Partition",
    budget_range: "₹80K – ₹4L",
    timeline: "2 – 5 weeks",
    scope: "Partition system",
    keywords: ["partition", "partitions", "divider"],
  },
  {
    slug: "aluminium-loft",
    title: "Aluminium Loft",
    budget_range: "₹40K – ₹2L",
    timeline: "1 – 3 weeks",
    scope: "Loft storage",
    keywords: ["loft", "loft storage", "overhead storage"],
  },
];

/** Services.html #process — operational journey (not dashboard Concept→Reveal) */
const PROCESS_STEPS = [
  {
    step: 1,
    name: "Enquiry",
    body: "You call us. We take approximate measurements over the phone and give you an initial quotation — no site visit needed for the first quote.",
  },
  {
    step: 2,
    name: "Site Visit",
    body: "If you're happy with the estimate, we visit your home, take exact measurements, and give you a final detailed quotation.",
  },
  {
    step: 3,
    name: "Booking & Discussion",
    body: "Once you confirm, we collect a booking amount. We then sit with you to discuss the full project — materials, finishes, layout — and show you samples.",
  },
  {
    step: 4,
    name: "Execution",
    body: "Our team begins work. A dedicated site supervisor visits regularly during working days to check quality and progress.",
  },
  {
    step: 5,
    name: "Handover & Check",
    body: "After completion, we re-measure the entire work, note any changes or adjustments, and inform you before final handover.",
  },
];

/** Contact.html studio cards */
const STUDIOS = [
  {
    city: "Vijayapura",
    brand: "Vinayak Aluminium Interiors",
    address:
      "Hubli-Bagalkot Road, Opp. Ayurgram Hospital, Amruth Nagar, Vijayapura — 586101",
    hours: "Mon–Sat · 10am to 5:30pm",
    phone: "+917019631202",
    phone_display: "+91 70196 31202",
    keywords: ["vijayapura", "bijapur"],
  },
  {
    city: "Dharwad",
    brand: "Vinayak Aluminium Interiors",
    address:
      "2nd Cross, Maratha Colony, Near Ganesh Temple, Shinde Avenue, Dharwad — 580001",
    hours: "Mon–Sat · 10am to 5pm",
    phone: "+919380348113",
    phone_display: "+91 93803 48113",
    keywords: ["dharwad", "hubli", "hubballi"],
  },
  {
    city: "Kalaburagi",
    brand: "Vinayak Aluminium Interiors",
    address:
      "SP Sambha Complex, Bidar Colony, Near Hanuman Temple, Kalaburagi — 585102",
    hours: "Mon–Sat · 10am to 5:30pm",
    phone: "+917483620588",
    phone_display: "+91 74836 20588",
    keywords: ["kalaburagi", "gulbarga"],
  },
  {
    city: "Hospet",
    brand: "Vinayak Aluminium Interiors",
    address:
      "First Floor, Above Ramdev Mobile Shop, Near Ganesh Travels Office, Station Road, Hospet — 583201",
    hours: "Mon–Sat · 10am to 5pm",
    phone: "+919483145955",
    phone_display: "+91 94831 45955",
    keywords: ["hospet", "hosapete"],
  },
];

const FAQ = {
  about:
    "Vinayak Aluminium Interiors is an interior architecture studio founded in 2014 (MMXIV). We specialise in aluminium interiors and full home fit-outs across Karnataka — with studios in Vijayapura, Dharwad, Kalaburagi, and Hospet.",
  contact:
    "Email us at vinayakainteriors308@gmail.com, visit Contact.html to book a consultation, or WhatsApp / call your nearest studio from The Studios list on our Contact page.",
  materials:
    "We work with aluminium systems plus laminates, hardware, and finishes suited to each brief. You can browse catalogues and ISO certification on our Contact page under Follow & Resources.",
};

/** Featured / journey projects shown on Projects.html & dashboard */
const PROJECTS = [
  {
    title: "Penthouse Fourteen",
    location: "4 BHK · Bangalore",
    materials: "Travertine, brass, oak, linen",
    blurb:
      "An elevated estate living room composition — warm brass accents with travertine and oak.",
  },
  {
    title: "The Basalt House",
    location: "Villa · Dharwad",
    materials: "Basalt, walnut, bronze",
    blurb:
      "A dark, cool villa palette — basalt stone with walnut and bronze detailing.",
  },
  {
    title: "Linen & Oak",
    location: "2 BHK · Hubli",
    materials: "Rift oak, linen, plaster",
    blurb:
      "A soft Scandinavian-leaning home — rift oak, linen, and quiet plaster.",
  },
];

module.exports = {
  COMPANY,
  DISCIPLINES,
  PROCESS_STEPS,
  STUDIOS,
  FAQ,
  PROJECTS,
};
