const pool = require("../config/db");
const Discipline = require("../models/disciplineModel");

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
    const discipline = await Discipline.update(
      req.params.id,
      req.body
    );

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

const deleteDiscipline = async (req, res) => {
  try {
    const discipline = await Discipline.remove(
      req.params.id
    );

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
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
};