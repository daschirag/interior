const pool = require("../config/db");
const SiteSettings = require("../models/siteSettingsModel");

const getSettings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM site_settings
      ORDER BY id ASC
      LIMIT 1
    `);

    res.json({
      success: true,
      settings: result.rows[0] || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.upsert(
      req.body
    );

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};