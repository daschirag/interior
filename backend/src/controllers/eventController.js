const pool = require("../config/db");

const logEvent = async (req, res) => {
  try {
    const { eventType, page, referrer, visitorId, city, meta } = req.body;

    const result = await pool.query(
      `
      INSERT INTO analytics_events
      (
        event_type,
        page,
        referrer,
        visitor_id,
        city,
        meta
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [eventType, page, referrer, visitorId, city, meta],
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to save analytics event",
    });
  }
};

module.exports = {
  logEvent,
};
