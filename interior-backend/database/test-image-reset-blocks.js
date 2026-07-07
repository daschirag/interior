require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const ContentBlock = require("../src/models/contentBlockModel");
const {
  ALL_CONTENT_BLOCKS,
  cloneDefaultBlock,
} = require("../src/data/contentBlockDefaults");

const FAKE_URL = "https://ik.imagekit.io/vqyudydbj/test-fake-upload.jpg";

function imageMap(images) {
  return Object.fromEntries(
    (images || []).map((img) => [img.key, img.url || ""]),
  );
}

async function testBlock(sectionKey) {
  const defaults = cloneDefaultBlock(sectionKey);
  if (!defaults?.images?.length) {
    return { sectionKey, skipped: true, reason: "text-only" };
  }

  const corrupted = (defaults.images || []).map((img) => ({
    ...img,
    url: FAKE_URL,
  }));

  await ContentBlock.updateBySectionKey(sectionKey, {
    fields: defaults.fields,
    images: corrupted,
  });

  const afterCorrupt = await ContentBlock.findBySectionKey(sectionKey);
  const corruptMap = imageMap(afterCorrupt.images);
  const corruptOk = defaults.images.every((img) => corruptMap[img.key] === FAKE_URL);
  if (!corruptOk) {
    return { sectionKey, pass: false, step: "corrupt", corruptMap };
  }

  await ContentBlock.resetToDefaults(defaults);
  const afterReset = await ContentBlock.findBySectionKey(sectionKey);
  const resetMap = imageMap(afterReset.images);
  const defaultMap = imageMap(defaults.images);
  const pass = defaults.images.every((img) => resetMap[img.key] === defaultMap[img.key]);

  return {
    sectionKey,
    pass,
    imageSlots: defaults.images.map((img) => img.key),
    resetMap,
    defaultMap,
  };
}

async function main() {
  await ContentBlock.createTable();

  const imageBlocks = ALL_CONTENT_BLOCKS.filter((b) => (b.images || []).length > 0);
  const results = [];

  for (const block of imageBlocks) {
    results.push(await testBlock(block.section_key));
  }

  console.log("\n=== Image reset audit (upload corrupt → reset-to-default) ===\n");
  console.log(
    "| Block | Image slots | Reset reverts images |",
  );
  console.log("|-------|-------------|----------------------|");

  let allPass = true;
  for (const r of results) {
    if (r.skipped) continue;
    const status = r.pass ? "PASS" : "FAIL";
    if (!r.pass) allPass = false;
    console.log(
      `| ${r.sectionKey} | ${r.imageSlots.join(", ")} | ${status} |`,
    );
    if (!r.pass) {
      console.log("  expected:", r.defaultMap);
      console.log("  got:", r.resetMap);
    }
  }

  const textOnly = ALL_CONTENT_BLOCKS.filter((b) => !(b.images || []).length);
  console.log("\nText-only blocks (no image slots):");
  console.log(textOnly.map((b) => b.section_key).join(", "));

  console.log(`\nOverall: ${allPass ? "ALL PASS" : "SOME FAILED"}`);
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
