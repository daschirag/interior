const { processMessage } = require("../src/services/chatbotEngine");

const tests = [
  ["services", "What interior services do you offer?"],
  ["pricing", "How much does a 2 BHK interior cost?"],
  ["off_topic", "What's the weather today?"],
  ["complex", "I need exact measurements for my 3BHK"],
];

for (const [label, msg] of tests) {
  const r = processMessage(msg);
  console.log("\n=== " + label.toUpperCase() + " ===");
  console.log("Q:", msg);
  console.log("intent:", r.intent, "| needsContact:", r.needsContact);
  console.log("A:", r.reply);
}
