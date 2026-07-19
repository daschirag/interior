const pool = require("../config/db");
const { resolveCityInput, isKnownCity } = require("../utils/karnatakaRegions");

function normalizeIndianMobile(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function isValidIndianMobile(raw) {
  return /^[6-9]\d{9}$/.test(normalizeIndianMobile(raw));
}

const submitContact = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      city,
      message,
      space_type: spaceTypeField,
      space,
      style,
    } = req.body;

    const space_type = spaceTypeField || space || null;

    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please share your name.",
      });
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!phone || !isValidIndianMobile(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    if (!city || !isKnownCity(city)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid Karnataka city name (e.g. Bagalkot, Dharwad, Bengaluru) so we can route your enquiry.",
      });
    }

    const resolved = resolveCityInput(city);
    const normalizedPhone = "+91" + normalizeIndianMobile(phone);

    const result = await pool.query(
      `
      INSERT INTO contact_submissions
      (name, email, phone, city, district, region, space_type, style, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        String(name).trim(),
        String(email).trim(),
        normalizedPhone,
        resolved.city,
        resolved.district,
        resolved.region,
        space_type,
        style || null,
        message && String(message).trim() ? String(message).trim() : null,
      ],
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

const getTotalLeads = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS total
      FROM contact_submissions
    `);

    res.json({
      success: true,
      total: result.rows[0].total,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch total leads",
    });
  }
};

module.exports = {
  submitContact,
  getRecentLeads,
  getTotalLeads,
};
