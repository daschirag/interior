import { useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import api from "../services/api";
import "../styles/projectModal.css";

function DistrictModal({
  district,
  onClose,
  onDistrictAdded,
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    if (district) {
      setName(district.name || "");
      setSlug(district.slug || "");
      setHeroTitle(district.hero_title || "");
      setHeroDescription(district.hero_description || "");
      setSeoTitle(district.seo_title || "");
      setSeoDescription(district.seo_description || "");
    } else {
      setName("");
      setSlug("");
      setHeroTitle("");
      setHeroDescription("");
      setSeoTitle("");
      setSeoDescription("");
    }
  }, [district]);

  const handleSave = async () => {
    try {
      const data = {
        name,
        slug,
        hero_title: heroTitle,
        hero_description: heroDescription,
        seo_title: seoTitle,
        seo_description: seoDescription,
      };

      if (district) {
        await api.put(`/districts/${district.id}`, data);
      } else {
        await api.post("/districts", data);
      }

      onDistrictAdded();
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Operation failed."
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="project-modal">

        <h2 className="modal-title">
          {district ? "Edit District" : "Add District"}
        </h2>

        <Input
          placeholder="District Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <Input
          placeholder="Hero Title"
          value={heroTitle}
          onChange={(e) => setHeroTitle(e.target.value)}
        />

        <Input
          placeholder="Hero Description"
          value={heroDescription}
          onChange={(e) => setHeroDescription(e.target.value)}
        />

        <Input
          placeholder="SEO Title"
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
        />

        <Input
          placeholder="SEO Description"
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />

        <div className="modal-buttons">
          <Button
            text={
              district
                ? "Update District"
                : "Save District"
            }
            onClick={handleSave}
          />

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default DistrictModal;