import { useEffect, useState } from "react";
import "../styles/projectModal.css";
import "../styles/websiteEditor.css";
import Button from "./Button";
import Input from "./Input";
import CompactImageUploader from "./CompactImageUploader";
import api from "../services/api";

const PUBLIC_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${PUBLIC_SITE_URL}${url}`;
  return `${PUBLIC_SITE_URL}/${url}`;
}

function StudioModal({ studio, onClose, onSaved }) {
  const [city, setCity] = useState("");
  const [brand, setBrand] = useState("Vinayak Aluminium Interiors");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneDisplay, setPhoneDisplay] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    if (studio) {
      setCity(studio.city || "");
      setBrand(studio.brand || "Vinayak Aluminium Interiors");
      setAddress(studio.address || "");
      setHours(studio.hours || "");
      setMapsUrl(studio.maps_url || "");
      setPhone(studio.phone || "");
      setPhoneDisplay(studio.phone_display || "");
      setImageUrl(studio.image_url || "");
      setDisplayOrder(studio.display_order || 0);
    } else {
      setCity("");
      setBrand("Vinayak Aluminium Interiors");
      setAddress("");
      setHours("Mon–Sat · 10am to 5:30pm");
      setMapsUrl("");
      setPhone("");
      setPhoneDisplay("");
      setImageUrl("");
      setDisplayOrder(0);
    }
  }, [studio]);

  const handleSave = async () => {
    if (!city.trim()) {
      alert("City name is required.");
      return;
    }

    try {
      const payload = {
        city: city.trim(),
        brand: brand.trim(),
        address: address.trim(),
        hours: hours.trim(),
        maps_url: mapsUrl.trim(),
        phone: phone.trim(),
        phone_display: phoneDisplay.trim() || phone.trim(),
        image_url: imageUrl || null,
        display_order: Number(displayOrder) || 0,
      };

      if (studio) {
        await api.put(`/studios/${studio.id}`, payload);
      } else {
        await api.post("/studios", payload);
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not save studio.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <h2 className="modal-title">
          {studio ? "Edit Studio Branch" : "Add Studio Branch"}
        </h2>

        <p className="studio-modal__hint">
          Shown on the Contact page under <strong>The Studios</strong> — address,
          hours, map link, and phone for each branch.
        </p>

        <Input
          placeholder="City (e.g. Vijayapura)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <Input
          placeholder="Brand name"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />

        <textarea
          className="admin-input"
          rows={3}
          placeholder="Full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            resize: "vertical",
            padding: "14px",
            marginBottom: "18px",
          }}
        />

        <Input
          placeholder="Hours (e.g. Mon–Sat · 10am to 5:30pm)"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <Input
          placeholder="Google Maps link"
          value={mapsUrl}
          onChange={(e) => setMapsUrl(e.target.value)}
        />

        <Input
          placeholder="Phone for tel: link (e.g. +917019631202)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          placeholder="Phone label on button (e.g. +91 70196 31202)"
          value={phoneDisplay}
          onChange={(e) => setPhoneDisplay(e.target.value)}
        />

        <Input
          type="number"
          placeholder="Display order (1 = first card)"
          value={displayOrder === 0 ? "" : displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
        />

        <div className="we-image-card">
          <strong>Branch photo (optional)</strong>
          <p className="we-muted">
            Stored for future use on the site — cards currently show address and
            contact buttons.
          </p>
          {imageUrl && (
            <div
              className="we-image-thumb"
              style={{ backgroundImage: `url(${resolveImageUrl(imageUrl)})` }}
            />
          )}
          <CompactImageUploader
            label={imageUrl ? "Replace photo" : "Add photo"}
            recommended="1200x800, landscape"
            onUpload={setImageUrl}
          />
          {imageUrl && (
            <button
              type="button"
              className="pm-images__clear"
              onClick={() => setImageUrl("")}
            >
              Remove photo
            </button>
          )}
        </div>

        <div className="modal-buttons">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <Button
            text={studio ? "Update Branch" : "Save Branch"}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

export default StudioModal;
