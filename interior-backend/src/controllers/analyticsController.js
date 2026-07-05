const pool = require("../config/db");
const {
  getRegionKeys,
  getRegionLabel,
  getDistrictsForRegion,
  slugFromRegionLabel,
} = require("../utils/karnatakaRegions");

function periodCondition(period, column = "created_at") {
  switch (period) {
    case "today":
      return `AND DATE(${column}) = CURRENT_DATE`;
    case "7":
      return `AND ${column} >= CURRENT_DATE - INTERVAL '6 days'`;
    case "30":
      return `AND ${column} >= CURRENT_DATE - INTERVAL '29 days'`;
    default:
      return "";
  }
}

const getAnalyticsSummary = async (req, res) => {
  try {
    const period = req.query.period || "all";
    const dateCondition = periodCondition(period);

    const pageViews = await pool.query(`
      SELECT COUNT(*) AS count FROM analytics_events
      WHERE event_type = 'page_view' ${dateCondition}
    `);

    const formStarts = await pool.query(`
      SELECT COUNT(*) AS count FROM analytics_events
      WHERE event_type = 'form_start' ${dateCondition}
    `);

    const formSubmits = await pool.query(`
      SELECT COUNT(*) AS count FROM analytics_events
      WHERE event_type = 'form_submit' ${dateCondition}
    `);

    const uniqueVisitors = await pool.query(`
      SELECT COUNT(DISTINCT visitor_id) AS count FROM analytics_events
      WHERE visitor_id IS NOT NULL ${dateCondition}
    `);

    const totalLeads = await pool.query(`
      SELECT COUNT(*) AS count FROM contact_submissions WHERE 1=1 ${dateCondition}
    `);

    const pageViewsCount = Number(pageViews.rows[0].count);
    const formSubmitsCount = Number(formSubmits.rows[0].count);

    const conversionRate =
      pageViewsCount === 0
        ? 0
        : Number(((formSubmitsCount / pageViewsCount) * 100).toFixed(1));

    res.status(200).json({
      success: true,
      data: {
        pageViews: pageViewsCount,
        uniqueVisitors: Number(uniqueVisitors.rows[0].count),
        formStarts: Number(formStarts.rows[0].count),
        formSubmits: formSubmitsCount,
        totalLeads: Number(totalLeads.rows[0].count),
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

    let interval = "29 days";
    if (period === "today") interval = "0 days";
    else if (period === "7") interval = "6 days";

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
        COALESCE(COUNT(*) FILTER (WHERE a.event_type = 'page_view'), 0) AS page_views,
        COALESCE(COUNT(*) FILTER (WHERE a.event_type = 'form_submit'), 0) AS form_submits
      FROM dates d
      LEFT JOIN analytics_events a ON DATE(a.created_at) = d.event_date
      GROUP BY d.event_date
      ORDER BY d.event_date
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

const getRegionAnalytics = async (req, res) => {
  try {
    const period = req.query.period || "all";
    const dateCondition = periodCondition(period);

    const views = await pool.query(`
      SELECT COALESCE(NULLIF(TRIM(city), ''), 'Unknown') AS city, COUNT(*)::int AS count
      FROM analytics_events
      WHERE event_type = 'page_view' ${dateCondition}
      GROUP BY city
    `);

    const leads = await pool.query(`
      SELECT COALESCE(NULLIF(TRIM(region), ''), 'Unknown') AS region,
             COALESCE(NULLIF(TRIM(district), ''), 'Unknown') AS district,
             COUNT(*)::int AS count
      FROM contact_submissions
      WHERE 1=1 ${dateCondition}
      GROUP BY region, district
    `);

    const regionMap = {};
    for (const key of getRegionKeys()) {
      regionMap[key] = { region: key, label: getRegionLabel(key), views: 0, enquiries: 0 };
    }
    regionMap.unknown = { region: "unknown", label: "Unknown", views: 0, enquiries: 0 };

    for (const row of views.rows) {
      regionMap.unknown.views += row.count;
    }

    for (const row of leads.rows) {
      const slug = slugFromRegionLabel(row.region);
      const bucket = regionMap[slug] ? slug : "unknown";
      regionMap[bucket].enquiries += row.count;
    }

    res.json({
      success: true,
      data: getRegionKeys()
        .map((k) => regionMap[k])
        .concat(regionMap.unknown.views || regionMap.unknown.enquiries ? [regionMap.unknown] : []),
    });
  } catch (error) {
    console.error("Region Analytics Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch region analytics" });
  }
};

const getRegionDistricts = async (req, res) => {
  try {
    const period = req.query.period || "all";
    const regionKey = req.params.region;
    const dateCondition = periodCondition(period);

    if (!getRegionKeys().includes(regionKey)) {
      return res.status(400).json({ success: false, message: "Invalid region" });
    }

    const views = await pool.query(`
      SELECT COALESCE(NULLIF(TRIM(city), ''), 'Unknown') AS city, COUNT(*)::int AS count
      FROM analytics_events
      WHERE event_type = 'page_view' ${dateCondition}
      GROUP BY city
    `);

    const enquiries = await pool.query(`
      SELECT COALESCE(NULLIF(TRIM(region), ''), 'Unknown') AS region,
             COALESCE(NULLIF(TRIM(district), ''), 'Unknown') AS district,
             COUNT(*)::int AS count
      FROM contact_submissions
      WHERE 1=1 ${dateCondition}
      GROUP BY region, district
    `);

    const regionLabel = getRegionLabel(regionKey);
    const districtMap = {};
    for (const d of getDistrictsForRegion(regionKey)) {
      districtMap[normalizeDistrict(d)] = { district: d, views: 0, enquiries: 0 };
    }

    for (const row of views.rows) {
      // Page-view events do not store region; district views are enquiry-only for now.
      void row;
    }

    for (const row of enquiries.rows) {
      if (row.region !== regionLabel) continue;
      const key = normalizeDistrict(row.district);
      if (!districtMap[key]) {
        districtMap[key] = { district: row.district, views: 0, enquiries: 0 };
      }
      districtMap[key].enquiries += row.count;
    }

    const data = Object.values(districtMap)
      .filter((d) => d.views > 0 || d.enquiries > 0)
      .sort((a, b) => (b.views + b.enquiries) - (a.views + a.enquiries));

    res.json({ success: true, region: regionKey, label: getRegionLabel(regionKey), data });
  } catch (error) {
    console.error("Region Districts Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch district analytics" });
  }
};

function normalizeDistrict(name) {
  return String(name || "").toLowerCase().trim();
}

const getVisitorInsights = async (req, res) => {
  try {
    const period = req.query.period || "all";
    const dateCondition = periodCondition(period);

    const topPages = await pool.query(`
      SELECT COALESCE(NULLIF(TRIM(page), ''), 'Unknown') AS page, COUNT(*)::int AS views
      FROM analytics_events
      WHERE event_type = 'page_view' ${dateCondition}
      GROUP BY page
      ORDER BY views DESC
      LIMIT 8
    `);

    const devices = await pool.query(`
      SELECT
        COALESCE(NULLIF(meta->>'device', ''), 'Unknown') AS device,
        COUNT(DISTINCT visitor_id)::int AS visitors
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND visitor_id IS NOT NULL
        ${dateCondition}
      GROUP BY device
      ORDER BY visitors DESC
    `);

    const visitorTypes = await pool.query(`
      WITH counts AS (
        SELECT visitor_id, COUNT(*)::int AS visits
        FROM analytics_events
        WHERE event_type = 'page_view'
          AND visitor_id IS NOT NULL
          ${dateCondition}
        GROUP BY visitor_id
      )
      SELECT
        CASE WHEN visits = 1 THEN 'New visitors' ELSE 'Returning visitors' END AS type,
        COUNT(*)::int AS count
      FROM counts
      GROUP BY type
    `);

    const peakHours = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*)::int AS views
      FROM analytics_events
      WHERE event_type = 'page_view' ${dateCondition}
      GROUP BY hour
      ORDER BY hour
    `);

    res.json({
      success: true,
      data: {
        topPages: topPages.rows,
        devices: devices.rows,
        visitorTypes: visitorTypes.rows,
        peakHours: peakHours.rows,
      },
    });
  } catch (error) {
    console.error("Visitor Insights Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch visitor insights" });
  }
};

module.exports = {
  getAnalyticsSummary,
  getTrafficTrends,
  getRegionAnalytics,
  getRegionDistricts,
  getVisitorInsights,
};
