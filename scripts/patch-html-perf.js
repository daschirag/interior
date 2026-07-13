const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "public");
const SITE = "https://interior-sigma-one.vercel.app";

function presetFor(url) {
  if (/-mobile\.jpg/i.test(url)) return "mobile";
  if (
    /img-featured-|img-svc-|img-living\.jpg|img-kitchen\.jpg/.test(url)
  ) {
    return "card";
  }
  if (
    /img-hero|img-room-|img-proc-|img-panel-|img-ba-|img-contact/.test(url)
  ) {
    return "hero";
  }
  return "card";
}

function patchFile(name, fn) {
  const file = path.join(ROOT, name);
  const before = fs.readFileSync(file, "utf8");
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    console.log("patched", name);
  } else {
    console.log("unchanged", name);
  }
}

const pages = [
  "dashboard.html",
  "Projects.html",
  "Services.html",
  "Contact.html",
  "index.html",
  "Chat.html",
];

for (const name of pages) {
  patchFile(name, (c) => {
    c = c.replace(
      /<link rel="canonical" href="\/([^"]+)" \/>/,
      `<link rel="canonical" href="${SITE}/$1" />`
    );

    if (
      c.includes('src="assets/js/api.js"') &&
      !c.includes("assets/js/image-url.js")
    ) {
      c = c.replace(
        '<script src="assets/js/api.js"></script>',
        '<script src="assets/js/image-url.js"></script>\n<script src="assets/js/api.js"></script>'
      );
    }

    c = c.replace(
      /<h4 data-i18n-key="footer\.(pages|studios|connect)">/g,
      '<h3 data-i18n-key="footer.$1">'
    );
    c = c.replace(
      /(data-i18n-key="footer\.(?:pages|studios|connect)">[^<]*)<\/h4>/g,
      "$1</h3>"
    );

    c = c.replace(
      /data-lazy-bg="([^"]+)"(?![^>]*data-ik-preset)/g,
      (m, url) => `data-lazy-bg="${url}" data-ik-preset="${presetFor(url)}"`
    );

    return c;
  });
}

patchFile("dashboard.html", (c) => {
  c = c.replace(
    '<video class="studio-walk-video" muted loop playsinline webkit-playsinline preload="none" poster="/assets/images/img-hero.jpg" data-lazy-video="/assets/video/walkthrough-small.mp4"></video>',
    `<video class="studio-walk-video" muted loop playsinline webkit-playsinline preload="none" poster="/assets/images/img-hero.jpg" data-lazy-video="/assets/video/walkthrough-small.mp4">
        <track kind="captions" srclang="en" label="English" src="/assets/video/walkthrough-captions.vtt" default />
      </video>`
  );
  return c;
});

patchFile("Services.html", (c) => {
  c = c.replace(
    '<div class="kicker brass" data-reveal data-cms-field="kicker">01 — What We Compose</div>',
    '<h2 class="kicker brass" data-reveal data-cms-field="kicker">01 — What We Compose</h2>'
  );
  return c;
});

console.log("done");
