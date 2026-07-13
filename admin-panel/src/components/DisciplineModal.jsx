import { useEffect, useState } from "react";
import Button from "./Button";
import Input from "./Input";
import api from "../services/api";

function DisciplineModal({
  discipline,
  onClose,
  onDisciplineAdded,
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [scope, setScope] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [projectsLink, setProjectsLink] = useState("");
  const [consultLink, setConsultLink] = useState("");

  useEffect(() => {
    if (discipline) {
      setTitle(discipline.title || "");
      setSlug(discipline.slug || "");
      setDisplayOrder(discipline.display_order || 0);
      setBudgetRange(discipline.budget_range || "");
      setTimeline(discipline.timeline || "");
      setScope(discipline.scope || "");
      setTags(
        discipline.tags ? discipline.tags.join(", ") : ""
      );
      setImageUrl(discipline.image_url || "");
      setProjectsLink(discipline.cta_projects_link || "");
      setConsultLink(discipline.cta_consult_link || "");
    } else {
      setTitle("");
      setSlug("");
      setDisplayOrder(0);
      setBudgetRange("");
      setTimeline("");
      setScope("");
      setTags("");
      setImageUrl("");
      setProjectsLink("");
      setConsultLink("");
    }
  }, [discipline]);

  const handleSave = async () => {
    try {
      const data = {
        title,
        slug,
        display_order: Number(displayOrder),
        budget_range: budgetRange,
        timeline,
        scope,
        tags: tags
          ? tags.split(",").map((tag) => tag.trim())
          : [],
        image_url: imageUrl,
        images: imageUrl
          ? [imageUrl, ...((discipline && discipline.images) || []).slice(1)]
          : ((discipline && discipline.images) || []).slice(1),
        cta_projects_link: projectsLink,
        cta_consult_link: consultLink,
      };

      if (discipline) {
        await api.put(`/disciplines/${discipline.id}`, data);
      } else {
        await api.post("/disciplines", data);
      }

      onDisciplineAdded();
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "700px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#23242d",
          border: "1px solid #353846",
          borderRadius: "12px",
          padding: "30px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            marginBottom: "25px",
            fontSize: "30px",
          }}
        >
          {discipline ? "Edit Discipline" : "Add Discipline"}
        </h2>

        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <Input
          type="number"
          placeholder="Display Order"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(e.target.value)}
        />

        <Input
          placeholder="Budget Range"
          value={budgetRange}
          onChange={(e) => setBudgetRange(e.target.value)}
        />

        <Input
          placeholder="Timeline"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
        />

        <Input
          placeholder="Scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        />

        <Input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <Input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <Input
          placeholder="Projects Link"
          value={projectsLink}
          onChange={(e) => setProjectsLink(e.target.value)}
        />

        <Input
          placeholder="Consult Link"
          value={consultLink}
          onChange={(e) => setConsultLink(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "30px",
          }}
        >
          <Button
            text="Cancel"
            onClick={onClose}
          />

          <Button
            text={
              discipline
                ? "Update Discipline"
                : "Save Discipline"
            }
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  );
}

export default DisciplineModal;