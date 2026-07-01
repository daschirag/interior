import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import "../styles/admin.css";

function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    districts: 0,
    disciplines: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [projects, districts, disciplines] =
        await Promise.all([
          api.get("/projects"),
          api.get("/districts"),
          api.get("/disciplines"),
        ]);

      setStats({
        projects: projects.data.projects.length,
        districts: districts.data.districts.length,
        disciplines:
          disciplines.data.disciplines.length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Dashboard
          </h1>

          <p
            style={{
              color: "#9ca3af",
              marginTop: "12px",
              fontSize: "16px",
            }}
          >
            Welcome back to the Vinayak
            Interiors Admin Panel.
          </p>
        </div>
      </div>

      {/* Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: "24px",
          marginTop: "40px",
        }}
      >
        <div className="table-card">
          <div style={{ padding: "30px" }}>
            <p
              style={{
                color: "#8b8b95",
                fontSize: "14px",
              }}
            >
              Projects
            </p>

            <h2
              style={{
                marginTop: "15px",
                fontSize: "48px",
                color: "white",
              }}
            >
              {stats.projects}
            </h2>
          </div>
        </div>

        <div className="table-card">
          <div style={{ padding: "30px" }}>
            <p
              style={{
                color: "#8b8b95",
                fontSize: "14px",
              }}
            >
              Districts
            </p>

            <h2
              style={{
                marginTop: "15px",
                fontSize: "48px",
                color: "white",
              }}
            >
              {stats.districts}
            </h2>
          </div>
        </div>

        <div className="table-card">
          <div style={{ padding: "30px" }}>
            <p
              style={{
                color: "#8b8b95",
                fontSize: "14px",
              }}
            >
              Disciplines
            </p>

            <h2
              style={{
                marginTop: "15px",
                fontSize: "48px",
                color: "white",
              }}
            >
              {stats.disciplines}
            </h2>
          </div>
        </div>
      </div>

      {/* Quick Actions */}

      <div
        className="table-card"
        style={{
          marginTop: "40px",
          padding: "30px",
        }}
      >
        <h2
          style={{
            color: "white",
            marginBottom: "25px",
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <button className="primary-btn">
            + New Project
          </button>

          <button className="primary-btn">
            + New District
          </button>

          <button className="primary-btn">
            + New Discipline
          </button>

          <button className="primary-btn">
            Upload Image
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;