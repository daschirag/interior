import { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import api from "../services/api";

function SiteSettingsForm({ settings, onSaved }) {
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [catalogPdfUrl, setCatalogPdfUrl] = useState("");
  const [studioLocations, setStudioLocations] = useState("");

  useEffect(() => {
    if (!settings) return;

    setCompanyName(settings.company_name || "");
    setPhone(settings.phone || "");
    setEmail(settings.email || "");
    setAddress(settings.address || "");
    setWhatsapp(settings.whatsapp || "");
    setInstagramUrl(settings.instagram_url || "");
    setFacebookUrl(settings.facebook_url || "");
    setYoutubeUrl(settings.youtube_url || "");
    setBusinessHours(settings.business_hours || "");
    setCatalogPdfUrl(settings.catalog_pdf_url || "");

    setStudioLocations(
      settings.studio_locations
        ? JSON.stringify(settings.studio_locations, null, 2)
        : ""
    );
  }, [settings]);

  const handleSave = async () => {
    try {
      await api.put("/site-settings", {
        company_name: companyName,
        phone,
        email,
        address,
        whatsapp,
        instagram_url: instagramUrl,
        facebook_url: facebookUrl,
        youtube_url: youtubeUrl,
        business_hours: businessHours,
        catalog_pdf_url: catalogPdfUrl,
        studio_locations: studioLocations
          ? JSON.parse(studioLocations)
          : [],
      });

      alert("Settings saved successfully!");
      onSaved();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          error.message
      );
    }
  };

  return (
    <>
      <Input
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <Input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <Input
        placeholder="WhatsApp"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />

      <Input
        placeholder="Instagram URL"
        value={instagramUrl}
        onChange={(e) => setInstagramUrl(e.target.value)}
      />

      <Input
        placeholder="Facebook URL"
        value={facebookUrl}
        onChange={(e) => setFacebookUrl(e.target.value)}
      />

      <Input
        placeholder="YouTube URL"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
      />

      <Input
        placeholder="Business Hours"
        value={businessHours}
        onChange={(e) => setBusinessHours(e.target.value)}
      />

      <Input
        placeholder="Catalog PDF URL"
        value={catalogPdfUrl}
        onChange={(e) => setCatalogPdfUrl(e.target.value)}
      />

      <label
        style={{
          display: "block",
          color: "#d8dde5",
          marginBottom: "10px",
          marginTop: "15px",
          fontWeight: "600",
        }}
      >
        Studio Locations (JSON)
      </label>

      <textarea
        rows={8}
        value={studioLocations}
        onChange={(e) => setStudioLocations(e.target.value)}
        style={{
          width: "100%",
          background: "#232833",
          color: "#fff",
          border: "1px solid #313847",
          borderRadius: "8px",
          padding: "15px",
          resize: "vertical",
          marginBottom: "25px",
          boxSizing: "border-box",
          fontSize: "15px",
        }}
      />

      <Button
        text="Save Settings"
        onClick={handleSave}
      />
    </>
  );
}

export default SiteSettingsForm;