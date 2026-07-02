import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import SiteSettingsForm from "../components/SiteSettingsForm";
import api from "../services/api";

function SiteSettings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/site-settings");
      setSettings(response.data.settings);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Site Settings"
        subtitle="Manage website information, contact details and social media."
      />

      <div className="table-card" style={{ padding: "35px" }}>
        <SiteSettingsForm
          settings={settings}
          onSaved={fetchSettings}
        />
      </div>
    </AdminLayout>
  );
}

export default SiteSettings;