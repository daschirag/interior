import { Link, useLocation } from "react-router-dom";
import "../styles/adminLayout.css";

function AdminLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Districts", path: "/districts" },
    { name: "Disciplines", path: "/disciplines" },
    { name: "Site Settings", path: "/site-settings" },
    { name: "Uploads", path: "/uploads" },
  ];

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="logo">
          <h2>
            Vinayak
            <span>Interiors</span>
          </h2>
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="logout-section">
          <Link to="/" className="menu-item">
            Logout
          </Link>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;