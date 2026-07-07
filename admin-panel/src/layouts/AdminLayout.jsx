import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/adminLayout.css";

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Before / After", path: "/before-after" },
    { name: "Studio Locations", path: "/studios" },
    { name: "Districts", path: "/districts" },
    { name: "Disciplines", path: "/disciplines" },
    { name: "Site Settings", path: "/site-settings" },
    { name: "Uploads", path: "/uploads" },
    { name: "Media Library", path: "/media-library" },
    { name: "Website Editor", path: "/website-editor" },
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
          <button type="button" className="menu-item logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;