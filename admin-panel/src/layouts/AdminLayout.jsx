import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/adminLayout.css";

/** Drawer layout (top bar + slide-in sidebar) applies at this width and below; above it nothing extra renders. */
const COMPACT_QUERY = "(max-width: 959px)";

function useCompactLayout() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return compact;
}

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const compact = useCompactLayout();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const wasOpenRef = useRef(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Close the drawer on navigation, and when the window grows back to desktop width.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!compact) setDrawerOpen(false);
  }, [compact]);

  // While open: Esc closes, page scroll is locked, focus moves into the drawer.
  // On close: focus returns to the menu button.
  useEffect(() => {
    if (!drawerOpen) {
      if (wasOpenRef.current) {
        wasOpenRef.current = false;
        menuButtonRef.current?.focus();
      }
      return undefined;
    }
    wasOpenRef.current = true;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The drawer only becomes focusable a frame or two after it turns visible, so retry briefly.
    let frame = 0;
    let tries = 0;
    const focusFirstItem = () => {
      const first = sidebarRef.current?.querySelector("a, button");
      first?.focus();
      if (first && document.activeElement !== first && tries++ < 10) {
        frame = requestAnimationFrame(focusFirstItem);
      }
    };
    focusFirstItem();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

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
    <div className={`admin-layout${drawerOpen ? " drawer-open" : ""}`}>
      {compact && (
        <header className="admin-topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="admin-menu-btn"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="admin-sidebar"
            onClick={() => setDrawerOpen((open) => !open)}
          >
            <span className="admin-menu-btn__bar" aria-hidden="true" />
            <span className="admin-menu-btn__bar" aria-hidden="true" />
            <span className="admin-menu-btn__bar" aria-hidden="true" />
          </button>
          <span className="admin-topbar__brand">
            Vinayak <span>Interiors</span>
          </span>
        </header>
      )}

      {compact && (
        <div
          className="admin-drawer-backdrop"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside id="admin-sidebar" ref={sidebarRef} className="sidebar">
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
