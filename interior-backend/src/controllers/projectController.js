const pool = require("../config/db");
const Project = require("../models/projectModel");
const EntityHistory = require("../models/entityHistoryModel");
const { getDefaultProjectBySlug } = require("../data/projectDefaults");
const { projectToSnapshot } = require("../utils/entitySnapshot");
const { parseLang, resolveProject } = require("../utils/i18nResolve");

async function snapshotProject(id, editedBy) {
  const existing = await Project.findById(id);
  if (!existing) return null;

  return EntityHistory.insertSnapshot({
    entityType: "project",
    entityId: id,
    snapshot: projectToSnapshot(existing),
    editedBy,
  });
}

const getProjects = async (req, res) => {
  try {
    const lang = parseLang(req.query.lang);
    let query = `
      SELECT *
      FROM projects
      WHERE is_active = true
    `;

    if (req.query.featured === "true") {
      query += `
        AND is_featured = true
      `;
    }

    query += `
      ORDER BY journey_order ASC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      lang,
      projects: result.rows.map((row) => resolveProject(row, lang)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProjectHistory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const history = await EntityHistory.findByEntity("project", id, 20);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project history",
    });
  }
};

const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const editedBy = req.user?.email || null;

    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await snapshotProject(id, editedBy);

    const project = await Project.update(id, req.body);

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const restoreProjectVersion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const historyId = Number(req.params.historyId);
    const editedBy = req.user?.email || null;

    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const version = await EntityHistory.findById(historyId);
    if (
      !version ||
      version.entity_type !== "project" ||
      Number(version.entity_id) !== id
    ) {
      return res.status(404).json({
        success: false,
        message: "History version not found",
      });
    }

    await snapshotProject(id, editedBy);

    const project = await Project.applySnapshot(id, version.snapshot || {});

    res.json({
      success: true,
      project,
      restored_from: version.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to restore project version",
    });
  }
};

const resetProjectToDefault = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const editedBy = req.user?.email || null;

    const existing = await Project.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const defaults = getDefaultProjectBySlug(existing.slug);
    if (!defaults) {
      return res.status(404).json({
        success: false,
        message: "No original defaults found for this project",
      });
    }

    await snapshotProject(id, editedBy);

    const project = await Project.applySnapshot(id, defaults);

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reset project to original",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.remove(req.params.id);

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getProjects,
  getProjectHistory,
  createProject,
  updateProject,
  restoreProjectVersion,
  resetProjectToDefault,
  deleteProject,
};
