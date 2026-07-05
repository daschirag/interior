require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const ContentBlock = require("../src/models/contentBlockModel");
const { ALL_CONTENT_BLOCKS } = require("../src/data/contentBlockDefaults");

async function main() {
  await ContentBlock.createTable();

  let inserted = 0;
  let existing = 0;

  for (const block of ALL_CONTENT_BLOCKS) {
    const current = await ContentBlock.findBySectionKey(block.section_key);
    if (current) {
      existing += 1;
      console.log("Exists:", block.section_key);
      continue;
    }

    await ContentBlock.resetToDefaults(block);
    inserted += 1;
    console.log("Inserted:", block.section_key);
  }

  console.log(
    `Done — ${inserted} new block(s) inserted, ${existing} already present (${ALL_CONTENT_BLOCKS.length} total).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
