const pool = require("../config/db");
const Project = require("../models/projectModel");

const getProjects = async (req, res) => {
  try {
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
      projects: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    const project = await Project.update(
      req.params.id,
      req.body
    );

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

const deleteProject = async (req, res) => {
  try {
    const project = await Project.remove(
      req.params.id
    );

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
  createProject,
  updateProject,
  deleteProject,
};