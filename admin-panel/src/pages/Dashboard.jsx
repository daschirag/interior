import { useCallback, useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import AdminLayout from "../layouts/AdminLayout";
import AnalyticsSection from "../components/AnalyticsSection";
import OverviewPanel from "../components/OverviewPanel";
import api from "../services/api";
import "../styles/admin.css";
import "../styles/dashboardAnalytics.css";

const EMPTY_ANALYTICS = {
  pageViews: 0,
  uniqueVisitors: 0,
  formStarts: 0,
  formSubmits: 0,
  totalLeads: 0,
  conversionRate: 0,
};

function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cmsStats, setCmsStats] = useState({
    projects: 0,
    districts: 0,
    disciplines: 0,
  });
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [leads, setLeads] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [projects, districts, disciplines, summary, leadsRes] =
        await Promise.all([
          api.get("/projects"),
          api.get("/districts"),
          api.get("/disciplines"),
          api.get("/analytics/summary?period=all"),
          api.get("/contact/recent-leads"),
        ]);

      setCmsStats({
        projects: projects.data.projects?.length ?? 0,
        districts: districts.data.districts?.length ?? 0,
        disciplines: disciplines.data.disciplines?.length ?? 0,
      });
      setAnalytics(summary.data.data || EMPTY_ANALYTICS);
      setLeads(leadsRes.data.data || []);
      setLastUpdated(
        new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      );
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(() => loadDashboard(true), 60000);
    return () => clearInterval(timer);
  }, [loadDashboard]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <AdminLayout>
      <header className="dashboard-header">
        <div className="dashboard-header-main">
          <p className="dashboard-eyebrow">Admin · Vinayak Interiors</p>
          <h1 className="dashboard-title">
            {greeting}
            {user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="dashboard-subtitle">
            Overview of your content, enquiries, and site performance.
          </p>
        </div>

        <div className="dashboard-header-actions">
          {lastUpdated && (
            <span className="dashboard-updated">
              Updated {lastUpdated}
            </span>
          )}
          <button
            type="button"
            className={`ghost-btn dashboard-refresh ${refreshing ? "is-spinning" : ""}`}
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </header>

      <nav className="dashboard-tabs" aria-label="Dashboard sections">
        <button
          type="button"
          data-tab="overview"
          className={`dashboard-tab ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          data-tab="analytics"
          className={`dashboard-tab ${activeTab === "analytics" ? "is-active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics & Reports
        </button>
      </nav>

      {activeTab === "overview" ? (
        <OverviewPanel
          cmsStats={cmsStats}
          analytics={analytics}
          leads={leads}
          loading={loading}
          onViewAnalytics={() => setActiveTab("analytics")}
        />
      ) : (
        <AnalyticsSection
          onDataRefresh={loadDashboard}
          initialLeads={leads}
        />
      )}
    </AdminLayout>
  );
}

export default Dashboard;
