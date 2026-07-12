const fs = require("fs");
const path = require("path");
const knowledge = require("../src/data/chatbotKnowledge");

let engineSrc = fs.readFileSync(
  path.join(__dirname, "../src/services/chatbotEngine.js"),
  "utf8",
);

engineSrc = engineSrc
  .replace(/^\/\*[\s\S]*?\*\/\r?\n/, "")
  .replace(/const \{[\s\S]*?\} = require\([^\)]+\);\r?\n/, "")
  .replace(/module\.exports[\s\S]*$/, "");

const out = `/* Auto-generated from interior-backend chatbot — do not edit by hand */
(function (g) {
  "use strict";
  var COMPANY = ${JSON.stringify(knowledge.COMPANY)};
  var DISCIPLINES = ${JSON.stringify(knowledge.DISCIPLINES)};
  var PROCESS_STEPS = ${JSON.stringify(knowledge.PROCESS_STEPS)};
  var STUDIOS = ${JSON.stringify(knowledge.STUDIOS)};
  var FAQ = ${JSON.stringify(knowledge.FAQ)};
  var PROJECTS = ${JSON.stringify(knowledge.PROJECTS || [])};

${engineSrc}

  g.VinayakChatEngine = {
    processMessage: processMessage,
    classifyIntent: classifyIntent,
    INTENTS: INTENTS,
  };
})(typeof window !== "undefined" ? window : globalThis);
`;

const dest = path.join(
  __dirname,
  "../../public/assets/js/chatbot-engine.js",
);
fs.writeFileSync(dest, out);
console.log("Wrote", dest);
