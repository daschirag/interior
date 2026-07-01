import { useEffect, useState } from "react";
import "../styles/projectModal.css";
import Button from "./Button";
import Input from "./Input";
import api from "../services/api";

function ProjectModal({
  project,
  onClose,
  onProjectAdded,
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");

  const [areaSqft, setAreaSqft] = useState("");
  const [description, setDescription] = useState("");
  const [materialTags, setMaterialTags] = useState("");
  const [images, setImages] = useState("");
  const [beforeImageUrl, setBeforeImageUrl] = useState("");
  const [afterImageUrl, setAfterImageUrl] = useState("");
  const [journeyOrder, setJourneyOrder] = useState(0);

  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setSlug(project.slug || "");
      setLocation(project.location || "");
      setYear(project.year || "");

      setAreaSqft(project.area_sqft || "");
      setDescription(project.description || "");

      setMaterialTags(
        project.material_tags
          ? project.material_tags.join(", ")
          : ""
      );

      setImages(
        project.images
          ? project.images.join(", ")
          : ""
      );

      setBeforeImageUrl(
        project.before_image_url || ""
      );

      setAfterImageUrl(
        project.after_image_url || ""
      );

      setJourneyOrder(
        project.journey_order || 0
      );

      setIsFeatured(
        project.is_featured || false
      );
    } else {
      setTitle("");
      setSlug("");
      setLocation("");
      setYear("");

      setAreaSqft("");
      setDescription("");
      setMaterialTags("");
      setImages("");
      setBeforeImageUrl("");
      setAfterImageUrl("");
      setJourneyOrder(0);

      setIsFeatured(false);
    }
  }, [project]);

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

        images: images
          ? images
              .split(",")
              .map((img) => img.trim())
              .filter(Boolean)
          : [],

        before_image_url: beforeImageUrl,
        after_image_url: afterImageUrl,

        journey_order: Number(journeyOrder),

        is_featured: isFeatured,
      };

      if (project) {
        await api.put(
          `/projects/${project.id}`,
          payload
        );
      } else {
        await api.post(
          "/projects",
          payload
        );
      }

      onProjectAdded();
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
      <div
        className="project-modal"
        style={{
          width: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h2 className="modal-title">
          {project
            ? "Edit Project"
            : "Add Project"}
        </h2>

        <Input
          placeholder="Project Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <Input
          placeholder="Slug"
          value={slug}
          onChange={(e) =>
            setSlug(e.target.value)
          }
        />

        <Input
          placeholder="Location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        />

        <Input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
        />

        <Input
          type="number"
          placeholder="Area (Sq Ft)"
          value={areaSqft}
          onChange={(e) =>
            setAreaSqft(e.target.value)
          }
        />

        <textarea
          className="admin-input"
          rows={4}
          placeholder="Project Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          style={{
            resize: "vertical",
            padding: "14px",
            marginBottom: "18px",
          }}
        />

        <Input
          placeholder="Material Tags (comma separated)"
          value={materialTags}
          onChange={(e) =>
            setMaterialTags(e.target.value)
          }
        />

        <Input
          placeholder="Image URLs (comma separated)"
          value={images}
          onChange={(e) =>
            setImages(e.target.value)
          }
        />
                <Input
          placeholder="Before Image URL"
          value={beforeImageUrl}
          onChange={(e) =>
            setBeforeImageUrl(e.target.value)
          }
        />

        <Input
          placeholder="After Image URL"
          value={afterImageUrl}
          onChange={(e) =>
            setAfterImageUrl(e.target.value)
          }
        />

       <Input
  type="number"
  placeholder="Journey Order"
  value={journeyOrder === 0 ? "" : journeyOrder}
  onChange={(e) =>
    setJourneyOrder(e.target.value)
  }
/>

        <label
  className="checkbox-row"
  style={{ marginTop: "10px", marginBottom: "25px" }}
>
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) =>
              setIsFeatured(e.target.checked)
            }
          />

          Featured Project
        </label>

        <div className="modal-buttons">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <Button
            text={
              project
                ? "Update Project"
                : "Save Project"
            }
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;