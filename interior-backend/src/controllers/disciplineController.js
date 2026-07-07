const pool = require("../config/db");
const Discipline = require("../models/disciplineModel");
const EntityHistory = require("../models/entityHistoryModel");
const { getDefaultDisciplineBySlug } = require("../data/disciplineDefaults");
const { disciplineToSnapshot } = require("../utils/entitySnapshot");

async function snapshotDiscipline(id, editedBy) {
  const existing = await Discipline.findById(id);
  if (!existing) return null;

  return EntityHistory.insertSnapshot({
    entityType: "discipline",
    entityId: id,
    snapshot: disciplineToSnapshot(existing),
    editedBy,
  });
}

const getDisciplines = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM disciplines
      WHERE is_active = true
      ORDER BY display_order ASC
    `);

    res.json({
      success: true,
      disciplines: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDisciplineHistory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const discipline = await Discipline.findById(id);
    if (!discipline) {
      return res.status(404).json({
        success: false,
        message: "Discipline not found",
      });
    }

    const history = await EntityHistory.findByEntity("discipline", id, 20);

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discipline history",
    });
  }
};

const createDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.create(req.body);

    res.json({
      success: true,
      discipline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDiscipline = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const editedBy = req.user?.email || null;

    const existing = await Discipline.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Discipline not found",
      });
    }

    await snapshotDiscipline(id, editedBy);

    const discipline = await Discipline.update(id, req.body);

    res.json({
      success: true,
      discipline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const restoreDisciplineVersion = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const historyId = Number(req.params.historyId);
    const editedBy = req.user?.email || null;

    const existing = await Discipline.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Discipline not found",
      });
    }

    const version = await EntityHistory.findById(historyId);
    if (
      !version ||
      version.entity_type !== "discipline" ||
      Number(version.entity_id) !== id
    ) {
      return res.status(404).json({
        success: false,
        message: "History version not found",
      });
    }

    await snapshotDiscipline(id, editedBy);

    const discipline = await Discipline.applySnapshot(id, version.snapshot || {});

    res.json({
      success: true,
      discipline,
      restored_from: version.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to restore discipline version",
    });
  }
};

const resetDisciplineToDefault = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const editedBy = req.user?.email || null;

    const existing = await Discipline.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Discipline not found",
      });
    }

    const defaults = getDefaultDisciplineBySlug(existing.slug);
    if (!defaults) {
      return res.status(404).json({
        success: false,
        message: "No original defaults found for this discipline",
      });
    }

    await snapshotDiscipline(id, editedBy);

    const discipline = await Discipline.applySnapshot(id, defaults);

    res.json({
      success: true,
      discipline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reset discipline to original",
    });
  }
};

const deleteDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.remove(req.params.id);

    res.json({
      success: true,
      discipline,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDisciplines,
  getDisciplineHistory,
  createDiscipline,
  updateDiscipline,
  restoreDisciplineVersion,
  resetDisciplineToDefault,
  deleteDiscipline,
};
