const fs = require("fs");
const path = require("path");

/**
 * Live production CMS snapshot (captured from Render API).
 * "Reset to original" restores to these values = current live website.
 */
const BASELINE_DIR = path.join(__dirname, "original-baselines");

function readBaseline(fileName) {
  const full = path.join(BASELINE_DIR, fileName);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

let cachedBlocks = null;
let cachedByKey = null;

function getLiveContentBlocks() {
  if (!cachedBlocks) {
    cachedBlocks = readBaseline("content-blocks.json");
  }
  return cachedBlocks;
}

function getDefaultsBySectionKey() {
  if (!cachedByKey) {
    cachedByKey = getLiveContentBlocks().reduce((acc, block) => {
      acc[block.section_key] = block;
      return acc;
    }, {});
  }
  return cachedByKey;
}

function cloneDefaultBlock(sectionKey) {
  const block = getDefaultsBySectionKey()[sectionKey];
  if (!block) return null;

  return {
    page: block.page,
    section_key: block.section_key,
    section_label: block.section_label,
    fields: JSON.parse(JSON.stringify(block.fields || {})),
    images: JSON.parse(JSON.stringify(block.images || [])),
  };
}

function getDefaultBlock(sectionKey) {
  return cloneDefaultBlock(sectionKey);
}

module.exports = {
  getLiveContentBlocks,
  get ALL_CONTENT_BLOCKS() {
    return getLiveContentBlocks();
  },
  get DEFAULTS_BY_SECTION_KEY() {
    return getDefaultsBySectionKey();
  },
  getDefaultBlock,
  cloneDefaultBlock,
};
