const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "public");

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".html"))) {
  const file = path.join(dir, f);
  let c = fs.readFileSync(file, "utf8");
  const n = c
    .replace(
      /<h4 data-i18n-key="footer\.(pages|studios|connect)">/g,
      '<h3 data-i18n-key="footer.$1">'
    )
    .replace(
      /(data-i18n-key="footer\.(?:pages|studios|connect)">[^<]*)<\/h4>/g,
      "$1</h3>"
    );
  if (n !== c) {
    fs.writeFileSync(file, n);
    console.log("fixed", f);
  }
}
