import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { FiDownload, FiFileText } from "react-icons/fi";
import api from "../services/api";
import RegionAnalyticsChart from "./RegionAnalyticsChart";
import VisitorInsightsChart from "./VisitorInsightsChart";
import { baseChartOptions, chartColors, PERIOD_LABELS } from "../utils/chartSetup";
import {
  exportAnalyticsCSV,
  exportAnalyticsPDF,
} from "../utils/analyticsExport";

const PERIODS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

const EMPTY_SUMMARY = {
  pageViews: 0,
  uniqueVisitors: 0,
  formStarts: 0,
  formSubmits: 0,
  totalLeads: 0,
  conversionRate: 0,
};

function AnalyticsSection({ onDataRefresh, initialLeads = [] }) {
  const [period, setPeriod] = useState("all");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [trends, setTrends] = useState([]);
  const [leads, setLeads] = useState(initialLeads);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [selectedRegionLabel, setSelectedRegionLabel] = useState("");

  const trafficRef = useRef(null);
  const funnelRef = useRef(null);
  const regionRef = useRef(null);
  const pagesRef = useRef(null);
  const deviceRef = useRef(null);
  const peakRef = useRef(null);

  const handleRegionSelect = useCallback((key) => {
    const labels = {
      north: "North Karnataka",
      south: "South Karnataka",
      coastal: "Coastal Karnataka",
      malnad: "Malnad Karnataka",
    };
    setSelectedRegionLabel(key ? labels[key] || key : "");
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const [summaryRes, trendsRes, leadsRes] = await Promise.all([
        api.get(`/analytics/summary?period=${period}`),
        api.get(`/analytics/trends?period=${period}`),
        api.get("/contact/recent-leads"),
      ]);

      setSummary(summaryRes.data.data || EMPTY_SUMMARY);
      setTrends(trendsRes.data.data || []);
      setLeads(leadsRes.data.data || []);
      setLastUpdated(
        new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      );
      onDataRefresh?.(true);
    } catch (err) {
      console.error("Analytics load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [period, onDataRefresh]);

  useEffect(() => {
    setLoading(true);
    loadAnalytics();
    const timer = setInterval(loadAnalytics, 60000);
    return () => clearInterval(timer);
  }, [loadAnalytics]);

  const trafficData = useMemo(() => {
    const labels = trends.map((item) =>
      new Date(item.event_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    );
    return {
      labels,
      datasets: [
        {
          label: "Page Views",
          data: trends.map((item) => Number(item.page_views)),
          borderColor: chartColors.azure,
          backgroundColor: "rgba(82,170,255,.12)",
          fill: "origin",
          tension: 0.45,
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: "Form Submits",
          data: trends.map((item) => Number(item.form_submits)),
          borderColor: chartColors.mint,
          backgroundColor: "rgba(102,198,168,.10)",
          fill: "origin",
          tension: 0.45,
          borderWidth: 2,
          pointRadius: 3,
        },
      ],
    };
  }, [trends]);

  const funnelData = useMemo(
    () => ({
      labels: ["Page Views", "Form Starts", "Form Submits", "Enquiries"],
      datasets: [
        {
          data: [
            summary.pageViews,
            summary.formStarts,
            summary.formSubmits,
            summary.totalLeads,
          ],
          backgroundColor: [
            chartColors.azure,
            chartColors.mint,
            chartColors.gold,
            chartColors.violet,
          ],
          borderRadius: 8,
        },
      ],
    }),
    [summary],
  );

  const funnelOptions = useMemo(() => {
    const options = baseChartOptions();
    options.plugins.legend.display = false;
    options.plugins.datalabels = {
      display: true,
      color: "#ffffff",
      anchor: "end",
      align: "top",
      font: { size: 12, weight: "bold" },
      formatter: (value) => value,
    };
    return options;
  }, []);

  const trafficOptions = useMemo(() => {
    const options = baseChartOptions();
    options.animation = false;
    options.plugins.legend.labels.font = { size: 11, weight: "600" };
    return options;
  }, []);

  const metrics = [
    { label: "Page Views", value: summary.pageViews, tone: "azure" },
    { label: "Unique Visitors", value: summary.uniqueVisitors, tone: "mint" },
    { label: "Form Starts", value: summary.formStarts, tone: "gold" },
    { label: "Form Submits", value: summary.formSubmits, tone: "violet" },
    { label: "Enquiries", value: summary.totalLeads, tone: "highlight" },
    { label: "Conversion", value: `${summary.conversionRate}%`, tone: "neutral" },
  ];

  const chartRefs = {
    traffic: trafficRef,
    funnel: funnelRef,
    region: regionRef,
    pages: pagesRef,
    device: deviceRef,
    peak: peakRef,
  };

  return (
    <section className="analytics-section">
      <div className="analytics-toolbar">
        <div>
          <p className="analytics-eyebrow">Reports</p>
          <h2 className="analytics-heading">Website Analytics</h2>
          <p className="analytics-subheading">
            {PERIOD_LABELS[period]} · traffic, regions, visitors & enquiries
          </p>
        </div>

        <div className="analytics-controls">
          <div className="period-pills" role="group" aria-label="Time period">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`period-pill ${period === p.value ? "is-active" : ""}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {lastUpdated && (
            <p className="analytics-updated">
              Last sync <strong>{lastUpdated}</strong>
            </p>
          )}

          <div className="analytics-export-row">
            <button
              type="button"
              className="ghost-btn"
              onClick={() => exportAnalyticsCSV(summary, leads, period)}
            >
              <FiDownload />
              CSV
            </button>
            <button
              type="button"
              className="ghost-btn ghost-btn--primary"
              onClick={() =>
                exportAnalyticsPDF(summary, leads, period, chartRefs, {
                  selectedRegionLabel,
                })
              }
            >
              <FiFileText />
              PDF Report
            </button>
          </div>
        </div>
      </div>

      <div className={`analytics-metrics ${loading ? "is-loading" : ""}`}>
        {metrics.map((metric) => (
          <div
            className={`analytics-metric-card analytics-metric-card--${metric.tone}`}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <h3>{loading ? <span className="metric-skeleton" /> : metric.value}</h3>
          </div>
        ))}
      </div>

      <div className="analytics-charts">
        <div className="analytics-chart-card">
          <div className="chart-card-head">
            <h3>Traffic Trend</h3>
            <span>Page views vs form submits over time</span>
          </div>
          <div className="chart-wrap">
            {loading ? (
              <div className="chart-placeholder">Loading chart…</div>
            ) : (
              <Line ref={trafficRef} data={trafficData} options={trafficOptions} />
            )}
          </div>
        </div>

        <div className="analytics-chart-card">
          <div className="chart-card-head">
            <h3>Conversion Funnel</h3>
            <span>Visitor journey from view to enquiry</span>
          </div>
          <div className="chart-wrap">
            {loading ? (
              <div className="chart-placeholder">Loading chart…</div>
            ) : (
              <Bar ref={funnelRef} data={funnelData} options={funnelOptions} />
            )}
          </div>
        </div>
      </div>

      <div className="analytics-charts analytics-charts--stacked">
        <RegionAnalyticsChart
          period={period}
          chartRef={regionRef}
          onRegionSelect={handleRegionSelect}
        />
        <VisitorInsightsChart
          period={period}
          pagesRef={pagesRef}
          deviceRef={deviceRef}
          peakRef={peakRef}
        />
      </div>

      <div className="analytics-leads">
        <div className="dash-panel-head dash-panel-head--row">
          <div>
            <h3>Recent Enquiries</h3>
            <p>Latest contact form submissions from the public site.</p>
          </div>
          <span className="leads-count">{leads.length} shown</span>
        </div>

        <div className="table-card">
          <table className="admin-table admin-table--compact">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Space</th>
                <th>Style</th>
                <th>Message</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="analytics-empty">
                    <div className="analytics-empty-title">No enquiries yet</div>
                    <div className="analytics-empty-sub">
                      Customer briefs will appear here once the contact form is live.
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td><strong className="lead-name">{lead.name}</strong></td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>
                      <span className="lead-badge lead-badge--city">{lead.city || "—"}</span>
                    </td>
                    <td>
                      <span className="lead-badge">{lead.space_type || "—"}</span>
                    </td>
                    <td>
                      <span className="lead-badge lead-badge--muted">
                        {lead.style || "—"}
                      </span>
                    </td>
                    <td className="lead-message">{lead.message || "—"}</td>
                    <td className="lead-date">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsSection;
