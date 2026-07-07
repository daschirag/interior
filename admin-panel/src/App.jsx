import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Districts from "./pages/Districts";
import Disciplines from "./pages/Disciplines";
import SiteSettings from "./pages/siteSettings";
import Uploads from "./pages/Uploads";
import MediaLibrary from "./pages/MediaLibrary";
import WebsiteEditor from "./pages/WebsiteEditor";
import BeforeAfterEditor from "./pages/BeforeAfterEditor";
import Studios from "./pages/Studios";

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
        path="/before-after"
        element={<BeforeAfterEditor />}
      />

      <Route
        path="/studios"
        element={<Studios />}
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
        path="/media-library"
        element={<MediaLibrary />}
      />

      <Route
        path="/website-editor"
        element={<WebsiteEditor />}
      />
    </Routes>
  );
}

export default App;