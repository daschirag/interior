const pool = require("../config/db");

const getAnalyticsSummary = async (req, res) => {
  try {
    const pageViews = await pool.query(
      `SELECT COUNT(*) FROM analytics_events
       WHERE event_type = 'page_view'`,
    );

    const formStarts = await pool.query(
      `SELECT COUNT(*) FROM analytics_events
       WHERE event_type = 'form_start'`,
    );

    const formSubmits = await pool.query(
      `SELECT COUNT(*) FROM analytics_events
       WHERE event_type = 'form_submit'`,
    );

    const uniqueVisitors = await pool.query(
      `SELECT COUNT(DISTINCT visitor_id)
       FROM analytics_events
       WHERE visitor_id IS NOT NULL`,
    );

    res.status(200).json({
      success: true,
      data: {
        pageViews: Number(pageViews.rows[0].count),
        formStarts: Number(formStarts.rows[0].count),
        formSubmits: Number(formSubmits.rows[0].count),
        uniqueVisitors: Number(uniqueVisitors.rows[0].count),
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
    });
  }
};

module.exports = {
  getAnalyticsSummary,
};
