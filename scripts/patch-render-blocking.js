/**
 * Patch public HTML for FCP: EN-only non-blocking fonts + deferred scripts.
 * Run: node scripts/patch-render-blocking.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public");

const EN_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&family=Space+Mono:wght@400&display=swap";

const ALL_FONTS_RE =
  /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet"\s*\/>/;

const FONTS_BLOCK = `<!-- EN fonts only (display=swap); kn/hi loaded by i18n.js on demand -->
<link rel="preload" as="style" href="${EN_FONTS}" />
<link rel="stylesheet" href="${EN_FONTS}" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="${EN_FONTS}" /></noscript>`;

const PAGES = [
  "dashboard.html",
  "Projects.html",
  "Services.html",
  "Contact.html",
  "index.html",
  "Chat.html",
];

function addDefer(html) {
  // Add defer to external scripts that lack async/defer (skip JSON-LD / type=module)
  return html.replace(
    /<script(\s[^>]*?)?\ssrc="([^"]+)"([^>]*)><\/script>/g,
    (full, pre, src, post) => {
      const attrs = ((pre || "") + (post || "")).toLowerCase();
      if (attrs.includes(" defer") || attrs.includes(" async")) return full;
      if (attrs.includes("type=\"application/ld+json\"")) return full;
      return `<script src="${src}" defer></script>`;
    }
  );
}

function patchFile(name) {
  const file = path.join(ROOT, name);
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  if (ALL_FONTS_RE.test(html)) {
    html = html.replace(ALL_FONTS_RE, FONTS_BLOCK);
  }

  html = addDefer(html);

  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    console.log("patched", name);
  } else {
    console.log("unchanged", name);
  }
}

PAGES.forEach(patchFile);
console.log("done");
