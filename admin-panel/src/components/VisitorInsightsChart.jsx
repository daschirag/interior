import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import api from "../services/api";
import { baseChartOptions, chartColors } from "../utils/chartSetup";

function VisitorInsightsChart({ period, pagesRef, deviceRef, peakRef }) {
  const [insights, setInsights] = useState({
    topPages: [],
    devices: [],
    visitorTypes: [],
    peakHours: [],
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/analytics/visitor-insights?period=${period}`);
      setInsights(res.data.data || {
        topPages: [],
        devices: [],
        visitorTypes: [],
        peakHours: [],
      });
    } catch (err) {
      console.error("Visitor insights failed:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const pageLabels = {
    "index.html": "Home",
    "dashboard.html": "Dashboard",
    "Projects.html": "Projects",
    "Services.html": "Studio",
    "Contact.html": "Contact",
  };

  const topPagesData = useMemo(() => ({
    labels: insights.topPages.map((p) => pageLabels[p.page] || p.page),
    datasets: [{
      label: "Views",
      data: insights.topPages.map((p) => p.views),
      backgroundColor: chartColors.azure,
      borderRadius: 6,
    }],
  }), [insights.topPages]);

  const deviceData = useMemo(() => ({
    labels: insights.devices.map((d) => d.device),
    datasets: [{
      data: insights.devices.map((d) => d.visitors),
      backgroundColor: [chartColors.azure, chartColors.mint, chartColors.gold, chartColors.violet],
      borderWidth: 0,
    }],
  }), [insights.devices]);

  const peakData = useMemo(() => ({
    labels: insights.peakHours.map((h) => `${h.hour}:00`),
    datasets: [{
      label: "Views by hour",
      data: insights.peakHours.map((h) => h.views),
      borderColor: chartColors.gold,
      backgroundColor: "rgba(233,180,76,.15)",
      fill: true,
      tension: 0.35,
    }],
  }), [insights.peakHours]);

  const deviceOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: chartColors.legend, font: { size: 11 }, boxWidth: 12 },
      },
      datalabels: { display: false },
    },
  }), []);

  const newCount = insights.visitorTypes.find((v) => v.type === "New visitors")?.count || 0;
  const returnCount = insights.visitorTypes.find((v) => v.type === "Returning visitors")?.count || 0;

  return (
    <div className="visitor-insights">
      <div className="chart-card-head">
        <h3>Visitor Insights</h3>
        <span>Where users go, what device they use, and when they visit</span>
      </div>

      {loading ? (
        <div className="chart-placeholder">Loading visitor insights…</div>
      ) : (
        <>
          <div className="visitor-kpi-row">
            <div className="visitor-kpi">
              <span>New visitors</span>
              <strong>{newCount}</strong>
            </div>
            <div className="visitor-kpi">
              <span>Returning</span>
              <strong>{returnCount}</strong>
            </div>
            <div className="visitor-kpi">
              <span>Top page</span>
              <strong>{insights.topPages[0]?.page?.replace(".html", "") || "—"}</strong>
            </div>
          </div>

          <div className="visitor-charts-grid">
            <div className="analytics-chart-card">
              <h4>Most Visited Pages</h4>
              <div className="chart-wrap chart-wrap--sm">
                <Bar ref={pagesRef} data={topPagesData} options={baseChartOptions()} />
              </div>
            </div>

            <div className="analytics-chart-card">
              <h4>Device Split</h4>
              <div className="chart-wrap chart-wrap--sm">
                <Doughnut ref={deviceRef} data={deviceData} options={deviceOptions} />
              </div>
            </div>

            <div className="analytics-chart-card analytics-chart-card--wide">
              <h4>Peak Visit Hours</h4>
              <p className="chart-hint">Best times to expect enquiries — plan follow-ups accordingly</p>
              <div className="chart-wrap chart-wrap--sm">
                <Line ref={peakRef} data={peakData} options={baseChartOptions()} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default VisitorInsightsChart;
