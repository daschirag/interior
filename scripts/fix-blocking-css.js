const fs = require("fs");
const path = require("path");

const files = [
  "dashboard.html",
  "Projects.html",
  "Services.html",
  "Contact.html",
  "Chat.html",
];

const re =
  /<style>html,body\{background:#0A0C0F;color:#ECEFF3;margin:0\}<\/style>\s*<link rel="stylesheet" href="assets\/css\/aurum\.css" media="print" onload="this\.media='all'" \/>\s*<noscript><link rel="stylesheet" href="assets\/css\/aurum\.css" \/><\/noscript>/;

const replacement =
  '<style>html,body{background:#0A0C0F;color:#ECEFF3;margin:0}</style>\n<link rel="stylesheet" href="assets/css/aurum.css" />';

for (const f of files) {
  const p = path.join(__dirname, "..", "public", f);
  let h = fs.readFileSync(p, "utf8");
  if (!re.test(h)) {
    console.log("skip (pattern not found)", f);
    continue;
  }
  h = h.replace(re, replacement);
  fs.writeFileSync(p, h, "utf8");
  console.log("fixed", f);
}
