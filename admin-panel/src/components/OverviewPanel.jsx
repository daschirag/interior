import { Link } from "react-router-dom";
import {
  FiFolder,
  FiMapPin,
  FiLayers,
  FiUpload,
  FiPlus,
  FiArrowRight,
} from "react-icons/fi";

const QUICK_ACTIONS = [
  {
    label: "New Project",
    desc: "Add portfolio work",
    to: "/projects",
    icon: FiFolder,
    accent: "#4d7cff",
  },
  {
    label: "New District",
    desc: "Location landing page",
    to: "/districts",
    icon: FiMapPin,
    accent: "#66c6a8",
  },
  {
    label: "New Discipline",
    desc: "Studio service card",
    to: "/disciplines",
    icon: FiLayers,
    accent: "#e9b44c",
  },
  {
    label: "Upload Image",
    desc: "Cloudinary assets",
    to: "/uploads",
    icon: FiUpload,
    accent: "#9b7ede",
  },
];

function OverviewPanel({ cmsStats, analytics, leads, loading, onViewAnalytics }) {
  const previewLeads = leads.slice(0, 5);

  return (
    <div className="overview-panel">
      <div className="dashboard-kpi-row">
        <div className="kpi-card kpi-card--highlight">
          <span className="kpi-label">Enquiries</span>
          <strong className="kpi-value">{loading ? "—" : analytics.totalLeads}</strong>
          <span className="kpi-hint">Contact form submissions</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Page Views</span>
          <strong className="kpi-value">{loading ? "—" : analytics.pageViews}</strong>
          <span className="kpi-hint">All time traffic</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Conversion</span>
          <strong className="kpi-value">
            {loading ? "—" : `${analytics.conversionRate}%`}
          </strong>
          <span className="kpi-hint">Submit ÷ views</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Projects Live</span>
          <strong className="kpi-value">{loading ? "—" : cmsStats.projects}</strong>
          <span className="kpi-hint">Portfolio entries</span>
        </div>
      </div>

      <div className="overview-grid">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Content Library</h2>
            <p>Manage what appears on the public website.</p>
          </div>
          <div className="content-stat-list">
            <Link to="/projects" className="content-stat-item">
              <div>
                <span>Projects</span>
                <strong>{cmsStats.projects}</strong>
              </div>
              <FiArrowRight />
            </Link>
            <Link to="/districts" className="content-stat-item">
              <div>
                <span>Districts</span>
                <strong>{cmsStats.districts}</strong>
              </div>
              <FiArrowRight />
            </Link>
            <Link to="/disciplines" className="content-stat-item">
              <div>
                <span>Disciplines</span>
                <strong>{cmsStats.disciplines}</strong>
              </div>
              <FiArrowRight />
            </Link>
          </div>
          <Link to="/site-settings" className="dash-panel-link">
            Site settings & studio info →
          </Link>
        </section>

        <section className="dash-panel">
          <div className="dash-panel-head">
            <h2>Quick Actions</h2>
            <p>Common tasks from one place.</p>
          </div>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="quick-action-card"
                  style={{ "--accent": action.accent }}
                >
                  <span className="quick-action-icon">
                    <Icon />
                  </span>
                  <div>
                    <strong>{action.label}</strong>
                    <span>{action.desc}</span>
                  </div>
                  <FiPlus className="quick-action-plus" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="dash-panel dash-panel--wide">
        <div className="dash-panel-head dash-panel-head--row">
          <div>
            <h2>Latest Enquiries</h2>
            <p>Most recent contact form briefs.</p>
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={onViewAnalytics}
          >
            View all analytics
          </button>
        </div>

        {previewLeads.length === 0 ? (
          <div className="overview-empty">
            <p>No enquiries yet.</p>
            <span>Submissions will appear here once the contact form is wired.</span>
          </div>
        ) : (
          <div className="table-card">
            <table className="admin-table admin-table--compact">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Project</th>
                  <th>Style</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {previewLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <strong className="lead-name">{lead.name}</strong>
                    </td>
                    <td>
                      <div className="lead-contact">
                        <span>{lead.email}</span>
                        <span>{lead.phone}</span>
                      </div>
                    </td>
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
                    <td className="lead-date">
                      {new Date(lead.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default OverviewPanel;
