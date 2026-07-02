const pool = require("../config/db");
const District = require("../models/districtModel");

const getDistricts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM districts
      WHERE is_active = true
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      districts: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDistrictBySlug = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM districts
      WHERE slug = $1
      AND is_active = true
      `,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "District not found",
      });
    }

    res.json({
      success: true,
      district: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createDistrict = async (req, res) => {
  try {
    const district = await District.create(req.body);

    res.json({
      success: true,
      district,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDistrict = async (req, res) => {
  try {
    const district = await District.update(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      district,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const district = await District.remove(
      req.params.id
    );

    res.json({
      success: true,
      district,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDistricts,
  getDistrictBySlug,
  createDistrict,
  updateDistrict,
  deleteDistrict,
};