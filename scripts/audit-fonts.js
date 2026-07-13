const https = require("https");
const http = require("http");

const cssUrl =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&family=Noto+Sans+Devanagari:wght@300;400;500&family=Noto+Sans+Kannada:wght@300;400;500&family=Noto+Serif+Devanagari:wght@300;400;500&family=Noto+Serif+Kannada:wght@300;400;500&family=Space+Mono:wght@400&display=swap";

const enOnly =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&family=Space+Mono:wght@400&display=swap";

function get(url, headers) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers: headers || {} }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location, headers).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        })
      );
    });
    req.on("error", reject);
  });
}

async function headSize(url) {
  const res = await get(url, {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  // GET full for size if needed
  return res.body.length;
}

async function analyze(label, url) {
  const css = await get(url, {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  const text = css.body.toString("utf8");
  const urls = [...text.matchAll(/url\(([^)]+)\)/g)].map((m) =>
    m[1].replace(/['"]/g, "")
  );
  let total = 0;
  const rows = [];
  for (const u of urls) {
    const size = await headSize(u);
    total += size;
    rows.push({ size, name: u.split("/").pop() });
  }
  console.log("\n===" + label + "===");
  console.log("CSS bytes:", css.body.length);
  console.log("Font files:", urls.length);
  rows
    .sort((a, b) => b.size - a.size)
    .forEach((r) =>
      console.log((r.size / 1024).toFixed(1) + " KB  " + r.name)
    );
  console.log("TOTAL fonts:", (total / 1024).toFixed(1), "KB");
}

(async () => {
  await analyze("ALL (current)", cssUrl);
  await analyze("EN-only (target)", enOnly);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
