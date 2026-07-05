const ContentBlock = require("../models/contentBlockModel");
const ContentBlockHistory = require("../models/contentBlockHistoryModel");
const { getDefaultBlock } = require("../data/contentBlockDefaults");

async function snapshotCurrentBlock(sectionKey, editedBy) {
  const existing = await ContentBlock.findBySectionKey(sectionKey);
  if (!existing) return null;

  return ContentBlockHistory.insertSnapshot({
    sectionKey,
    fields: existing.fields || {},
    images: existing.images || [],
    editedBy,
  });
}

const getContentBlocks = async (req, res) => {
  try {
    const { page } = req.query;
    const blocks = await ContentBlock.findAll(page || null);

    res.json({
      success: true,
      blocks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content blocks",
    });
  }
};

const getContentBlock = async (req, res) => {
  try {
    const block = await ContentBlock.findBySectionKey(req.params.sectionKey);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Content block not found",
      });
    }

    res.json({
      success: true,
      block,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content block",
    });
  }
};

const getContentBlockHistory = async (req, res) => {
  try {
    const block = await ContentBlock.findBySectionKey(req.params.sectionKey);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Content block not found",
      });
    }

    const history = await ContentBlockHistory.findBySectionKey(
      req.params.sectionKey,
      20,
    );

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch content block history",
    });
  }
};

const updateContentBlock = async (req, res) => {
  try {
    const { fields, images } = req.body;
    const sectionKey = req.params.sectionKey;
    const editedBy = req.user?.email || null;

    const existing = await ContentBlock.findBySectionKey(sectionKey);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Content block not found",
      });
    }

    await snapshotCurrentBlock(sectionKey, editedBy);

    const block = await ContentBlock.updateBySectionKey(sectionKey, {
      fields,
      images,
    });

    res.json({
      success: true,
      block,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "Content block not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update content block",
    });
  }
};

const restoreContentBlockVersion = async (req, res) => {
  try {
    const sectionKey = req.params.sectionKey;
    const historyId = Number(req.params.historyId);
    const editedBy = req.user?.email || null;

    const existing = await ContentBlock.findBySectionKey(sectionKey);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Content block not found",
      });
    }

    const version = await ContentBlockHistory.findById(historyId);
    if (!version || version.section_key !== sectionKey) {
      return res.status(404).json({
        success: false,
        message: "History version not found",
      });
    }

    await snapshotCurrentBlock(sectionKey, editedBy);

    const block = await ContentBlock.updateBySectionKey(sectionKey, {
      fields: version.fields || {},
      images: version.images || [],
    });

    res.json({
      success: true,
      block,
      restored_from: version.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to restore content block version",
    });
  }
};

const resetContentBlockToDefault = async (req, res) => {
  try {
    const sectionKey = req.params.sectionKey;
    const editedBy = req.user?.email || null;
    const defaults = getDefaultBlock(sectionKey);

    if (!defaults) {
      return res.status(404).json({
        success: false,
        message: "No default content found for this section",
      });
    }

    const existing = await ContentBlock.findBySectionKey(sectionKey);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Content block not found",
      });
    }

    await snapshotCurrentBlock(sectionKey, editedBy);

    const block = await ContentBlock.resetToDefaults(defaults);

    res.json({
      success: true,
      block,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reset content block to default",
    });
  }
};

const createContentBlock = async (req, res) => {
  try {
    const { page, section_key, section_label, fields, images } = req.body;

    if (!page || !section_key || !section_label) {
      return res.status(400).json({
        success: false,
        message: "page, section_key, and section_label are required",
      });
    }

    const block = await ContentBlock.upsert({
      page,
      section_key,
      section_label,
      fields: fields || {},
      images: images || [],
    });

    res.status(201).json({
      success: true,
      block,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create content block",
    });
  }
};

const deleteContentBlock = async (req, res) => {
  try {
    const block = await ContentBlock.removeBySectionKey(req.params.sectionKey);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Content block not found",
      });
    }

    res.json({
      success: true,
      block,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content block",
    });
  }
};

module.exports = {
  getContentBlocks,
  getContentBlock,
  getContentBlockHistory,
  updateContentBlock,
  restoreContentBlockVersion,
  resetContentBlockToDefault,
  createContentBlock,
  deleteContentBlock,
};
