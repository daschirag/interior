require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const ContentBlock = require("../src/models/contentBlockModel");
const { ALL_CONTENT_BLOCKS } = require("../src/data/contentBlockDefaults");

function mergeBlockWithDefaults(existing, defaults) {
  const mergedFields = { ...(existing.fields || {}) };
  let fieldsChanged = false;
  for (const [key, value] of Object.entries(defaults.fields || {})) {
    if (mergedFields[key] == null || mergedFields[key] === "") {
      mergedFields[key] = value;
      fieldsChanged = true;
    }
  }

  const currentImages = Array.isArray(existing.images) ? existing.images : [];
  const imageKeys = new Set(currentImages.map((img) => img.key));
  const mergedImages = currentImages.map((img) => ({ ...img }));
  let imagesChanged = false;

  for (const img of defaults.images || []) {
    if (!img?.key || imageKeys.has(img.key)) continue;
    mergedImages.push({ ...img });
    imagesChanged = true;
  }

  return {
    changed: fieldsChanged || imagesChanged,
    block: {
      page: defaults.page,
      section_key: defaults.section_key,
      section_label: defaults.section_label,
      fields: mergedFields,
      images: mergedImages,
    },
  };
}

async function main() {
  await ContentBlock.createTable();

  let inserted = 0;
  let merged = 0;
  let existing = 0;

  for (const block of ALL_CONTENT_BLOCKS) {
    const current = await ContentBlock.findBySectionKey(block.section_key);
    if (!current) {
      await ContentBlock.resetToDefaults(block);
      inserted += 1;
      console.log("Inserted:", block.section_key);
      continue;
    }

    const { changed, block: mergedBlock } = mergeBlockWithDefaults(current, block);
    if (changed) {
      await ContentBlock.updateBySectionKey(block.section_key, {
        fields: mergedBlock.fields,
        images: mergedBlock.images,
      });
      merged += 1;
      console.log("Merged defaults:", block.section_key);
    } else {
      existing += 1;
      console.log("Exists:", block.section_key);
    }
  }

  console.log(
    `Done — ${inserted} inserted, ${merged} merged, ${existing} unchanged (${ALL_CONTENT_BLOCKS.length} total).`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
