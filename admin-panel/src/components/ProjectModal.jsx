import { useEffect, useState } from "react";
import "../styles/projectModal.css";
import "../styles/websiteEditor.css";
import Button from "./Button";
import Input from "./Input";
import CompactImageUploader from "./CompactImageUploader";
import api from "../services/api";

const PUBLIC_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000";

const SECTIONS = [
  { id: "details", label: "Details" },
  { id: "images", label: "Images" },
];

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${PUBLIC_SITE_URL}${url}`;
  return `${PUBLIC_SITE_URL}/${url}`;
}

function ImageSlot({ title, hint, url, recommended, onUpload, onRemove }) {
  return (
    <div className="we-image-card">
      <div className="we-image-card__top">
        <strong>{title}</strong>
      </div>
      {hint && <p className="we-image-hint">{hint}</p>}
      {url ? (
        <div
          className="we-image-thumb"
          style={{ backgroundImage: `url(${resolveImageUrl(url)})` }}
        />
      ) : (
        <p className="pm-images__empty">No image yet — upload one below.</p>
      )}
      <CompactImageUploader
        label={url ? "Replace image" : "Add image"}
        recommended={recommended}
        onUpload={onUpload}
      />
      {url && onRemove && (
        <button type="button" className="pm-images__clear" onClick={onRemove}>
          Remove image
        </button>
      )}
    </div>
  );
}

function ProjectModal({ project, onClose, onProjectAdded }) {
  const [activeSection, setActiveSection] = useState("details");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [areaSqft, setAreaSqft] = useState("");
  const [description, setDescription] = useState("");
  const [materialTags, setMaterialTags] = useState("");
  const [images, setImages] = useState([]);
  const [journeyOrder, setJourneyOrder] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    setActiveSection("details");
    if (project) {
      setTitle(project.title || "");
      setSlug(project.slug || "");
      setLocation(project.location || "");
      setYear(project.year || "");
      setAreaSqft(project.area_sqft || "");
      setDescription(project.description || "");
      setMaterialTags(
        project.material_tags ? project.material_tags.join(", ") : "",
      );
      setImages(Array.isArray(project.images) ? [...project.images] : []);
      setJourneyOrder(project.journey_order || 0);
      setIsFeatured(project.is_featured || false);
    } else {
      setTitle("");
      setSlug("");
      setLocation("");
      setYear("");
      setAreaSqft("");
      setDescription("");
      setMaterialTags("");
      setImages([]);
      setJourneyOrder(0);
      setIsFeatured(false);
    }
  }, [project]);

  const coverUrl = images.length ? images[0] : "";
  const galleryImages = images.slice(1);

  const handleSave = async () => {
    try {
      const payload = {
        title,
        slug,
        location,
        year: Number(year),
        area_sqft: Number(areaSqft),
        description,
        material_tags: materialTags
          ? materialTags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        images: images.filter(Boolean),
        journey_order: Number(journeyOrder),
        is_featured: isFeatured,
      };

      if (project) {
        await api.put(`/projects/${project.id}`, payload);
      } else {
        await api.post("/projects", payload);
      }

      onProjectAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="project-modal">
        <h2 className="modal-title">
          {project ? "Edit Project" : "Add Project"}
        </h2>

        <div className="pm-tabs we-tabs">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? "active" : ""}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="pm-body">
          {activeSection === "details" && (
            <div className="pm-section">
              <Input
                placeholder="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Input
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Area (Sq Ft)"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
              />

              <textarea
                className="admin-input"
                rows={4}
                placeholder="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  resize: "vertical",
                  padding: "14px",
                  marginBottom: "18px",
                }}
              />

              <Input
                placeholder="Material Tags (comma separated)"
                value={materialTags}
                onChange={(e) => setMaterialTags(e.target.value)}
              />

              <Input
                type="number"
                placeholder="Journey Order"
                value={journeyOrder === 0 ? "" : journeyOrder}
                onChange={(e) => setJourneyOrder(e.target.value)}
              />

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Featured Project
              </label>
            </div>
          )}

          {activeSection === "images" && (
            <div className="pm-section">
              <div className="we-images">
                <h3>Images</h3>
                <p className="we-muted">
                  Journey cover and gallery images for this project in the
                  horizontal scroll gallery.
                </p>

                <ImageSlot
                  title="Journey cover image"
                  hint="Recommended: 1920×1080, landscape"
                  url={coverUrl}
                  recommended="1920x1080, landscape"
                  onUpload={(url) =>
                    setImages([url, ...images.slice(1)].filter(Boolean))
                  }
                  onRemove={
                    coverUrl ? () => setImages(images.slice(1)) : undefined
                  }
                />

                {galleryImages.map((url, index) => (
                  <ImageSlot
                    key={`gallery-${index}`}
                    title={`Gallery image ${index + 1}`}
                    hint="Optional — featured panel or secondary view"
                    url={url}
                    recommended="1920x1080, landscape"
                    onUpload={(nextUrl) => {
                      const next = [...images];
                      next[index + 1] = nextUrl;
                      setImages(next.filter(Boolean));
                    }}
                    onRemove={() => {
                      const next = [...images];
                      next.splice(index + 1, 1);
                      setImages(next);
                    }}
                  />
                ))}

                <div className="we-image-card pm-images__add">
                  <strong>Add another image</strong>
                  <p className="we-muted">
                    Upload an extra gallery image for this project.
                  </p>
                  <CompactImageUploader
                    label="Add image"
                    recommended="1920x1080, landscape"
                    onUpload={(url) => setImages([...images, url])}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>

          <Button
            text={project ? "Update Project" : "Save Project"}
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;
