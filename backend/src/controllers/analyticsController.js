const pool = require("../config/db");

const getAnalyticsSummary = async (req, res) => {
  try {
    const period = req.query.period || "all";

    let dateCondition = "";

    switch (period) {
      case "today":
        dateCondition = "AND DATE(created_at) = CURRENT_DATE";
        break;

      case "7":
        dateCondition = "AND created_at >= CURRENT_DATE - INTERVAL '6 days'";
        break;

      case "30":
        dateCondition = "AND created_at >= CURRENT_DATE - INTERVAL '29 days'";
        break;

      default:
        dateCondition = "";
    }
    const [pageViews, formStarts, formSubmits, uniqueVisitors, totalLeads] =
      await Promise.all([
        pool.query(`
        SELECT COUNT(*) AS count
        FROM analytics_events
        WHERE event_type = 'page_view'
${dateCondition}
      `),

        pool.query(`
        SELECT COUNT(*) AS count
        FROM analytics_events
        WHERE event_type = 'form_start'
${dateCondition}
      `),

        pool.query(`
        SELECT COUNT(*) AS count
        FROM analytics_events
        WHERE event_type = 'form_submit'
${dateCondition}
      `),

        pool.query(`
        SELECT COUNT(DISTINCT visitor_id) AS count
        FROM analytics_events
      WHERE visitor_id IS NOT NULL
${dateCondition}
      `),

        pool.query(`
        SELECT COUNT(*) AS count
       FROM contact_submissions
WHERE 1=1
${dateCondition}
      `),
      ]);

    const pageViewsCount = Number(pageViews.rows[0].count);
    const formStartsCount = Number(formStarts.rows[0].count);
    const formSubmitsCount = Number(formSubmits.rows[0].count);
    const uniqueVisitorsCount = Number(uniqueVisitors.rows[0].count);
    const totalLeadsCount = Number(totalLeads.rows[0].count);

    const conversionRate =
      pageViewsCount === 0
        ? 0
        : ((formSubmitsCount / pageViewsCount) * 100).toFixed(1);

    res.status(200).json({
      success: true,
      data: {
        pageViews: pageViewsCount,
        uniqueVisitors: uniqueVisitorsCount,
        formStarts: formStartsCount,
        formSubmits: formSubmitsCount,
        totalLeads: totalLeadsCount,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("Analytics Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
    });
  }
};
const getTrafficTrends = async (req, res) => {
  try {
    const period = req.query.period || "all";

    let interval;

    switch (period) {
      case "today":
        interval = "0 days";
        break;

      case "7":
        interval = "6 days";
        break;

      case "30":
        interval = "29 days";
        break;

      default:
        interval = "29 days"; // Last 30 days for All Time chart
    }

    const result = await pool.query(`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${interval}',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS event_date
      )

      SELECT
        d.event_date,

        COALESCE(
          COUNT(*) FILTER (
            WHERE a.event_type = 'page_view'
          ),
          0
        ) AS page_views,

        COALESCE(
          COUNT(*) FILTER (
            WHERE a.event_type = 'form_submit'
          ),
          0
        ) AS form_submits

      FROM dates d

      LEFT JOIN analytics_events a
      ON DATE(a.created_at) = d.event_date

      GROUP BY d.event_date

      ORDER BY d.event_date;
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Traffic Trends Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch traffic trends",
    });
  }
};
module.exports = {
  getAnalyticsSummary,
  getTrafficTrends,
};
