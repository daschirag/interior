const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "public");

const CRITICAL =
  '<style>html,body{background:#0A0C0F;color:#ECEFF3;margin:0}</style>\n';

const BLOCKING_AURUM =
  /<link rel="stylesheet" href="assets\/css\/aurum\.css" \/>/;

const ASYNC_AURUM = `${CRITICAL}<link rel="stylesheet" href="assets/css/aurum.css" media="print" onload="this.media='all'" />
<noscript><link rel="stylesheet" href="assets/css/aurum.css" /></noscript>`;

const ASYNC_ALREADY =
  /media="print" onload="this\.media='all'" \/>\s*\n?<noscript><link rel="stylesheet" href="assets\/css\/aurum\.css"/;

[
  "dashboard.html",
  "Projects.html",
  "Services.html",
  "Contact.html",
  "Chat.html",
].forEach((name) => {
  const file = path.join(ROOT, name);
  let html = fs.readFileSync(file, "utf8");
  if (ASYNC_ALREADY.test(html) && html.includes("background:#0A0C0F")) {
    console.log("ok", name);
    return;
  }
  if (html.includes('href="assets/css/aurum.css" media="print"')) {
    // already async but maybe missing critical
    if (!html.includes("background:#0A0C0F")) {
      html = html.replace(
        '<link rel="stylesheet" href="assets/css/aurum.css" media="print"',
        CRITICAL +
          '<link rel="stylesheet" href="assets/css/aurum.css" media="print"'
      );
      fs.writeFileSync(file, html, "utf8");
      console.log("critical+", name);
    } else console.log("ok", name);
    return;
  }
  if (BLOCKING_AURUM.test(html)) {
    html = html.replace(BLOCKING_AURUM, ASYNC_AURUM);
    fs.writeFileSync(file, html, "utf8");
    console.log("async", name);
  } else {
    console.log("skip", name);
  }
});
