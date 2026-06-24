const pool = require("../config/db");

const submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const result = await pool.query(
      `
      INSERT INTO contact_submissions
      (name, email, phone, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, phone, message],
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save contact form",
    });
  }
};
const getRecentLeads = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
    });
  }
};
module.exports = {
  submitContact,
  getRecentLeads,
};
