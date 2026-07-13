const fs = require("fs");
const path = require("path");

const presets = {
  card: [
    "img-featured-",
    "img-svc-",
    "img-living.jpg",
    "img-kitchen.jpg",
  ],
  hero: [
    "img-hero.jpg",
    "img-room-",
    "img-proc-",
    "img-panel-",
    "img-ba-",
    "img-contact.jpg",
  ],
  mobile: ["-mobile.jpg"],
};

function presetFor(url) {
  if (/-mobile\.jpg/i.test(url)) return "mobile";
  if (presets.card.some((p) => url.includes(p))) return "card";
  if (presets.hero.some((p) => url.includes(p))) return "hero";
  return "card";
}

const dir = path.join(__dirname, "..", "public");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".html"))) {
  const file = path.join(dir, f);
  let c = fs.readFileSync(file, "utf8");
  const n = c.replace(
    /data-lazy-bg="([^"]+)"(?![^>]*data-ik-preset)/g,
    (m, url) => `data-lazy-bg="${url}" data-ik-preset="${presetFor(url)}"`
  );
  if (n !== c) {
    fs.writeFileSync(file, n);
    console.log("presets", f);
  }
}
