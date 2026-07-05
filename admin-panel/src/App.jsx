import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Districts from "./pages/Districts";
import Disciplines from "./pages/Disciplines";
import SiteSettings from "./pages/siteSettings";
import Uploads from "./pages/Uploads";
import WebsiteEditor from "./pages/WebsiteEditor";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/projects"
        element={<Projects />}
      />

      <Route
        path="/districts"
        element={<Districts />}
      />

      <Route
        path="/disciplines"
        element={<Disciplines />}
      />

      <Route
        path="/site-settings"
        element={<SiteSettings />}
      />

      <Route
        path="/uploads"
        element={<Uploads />}
      />

      <Route
        path="/website-editor"
        element={<WebsiteEditor />}
      />
    </Routes>
  );
}

export default App;