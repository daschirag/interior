import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import CompactImageUploader from "./CompactImageUploader";

function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function ProjectEditorPanel({
  projectId,
  projectTitle,
  onPreview,
  onSaved,
  onDirtyChange,
  onClose,
}) {
  const [project, setProject] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const dirty = project && saved && JSON.stringify(project) !== JSON.stringify(saved);

  const pushPreview = useCallback(
    (next) => {
      onPreview({ id: projectId, project: next });
    },
    [projectId, onPreview],
  );

  useEffect(() => {
    onDirtyChange?.(!!dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatus("");

    api
      .get("/projects")
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const found = (res.data.projects || []).find(
          (p) => String(p.id) === String(projectId),
        );
        if (!found) return;
        setProject(found);
        setSaved(found);
        pushPreview(found);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, pushPreview]);

  const update = (patch) => {
    setProject((prev) => {
      const next = { ...prev, ...patch };
      pushPreview(next);
      return next;
    });
  };

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        title: project.title,
        slug: project.slug,
        location: project.location || "",
        year: project.year ? Number(project.year) : null,
        area_sqft: project.area_sqft ? Number(project.area_sqft) : null,
        project_type: project.project_type || "",
        description: project.description || "",
        material_tags: project.material_tags || [],
        images: project.images || [],
        before_image_url: project.before_image_url || "",
        after_image_url: project.after_image_url || "",
        journey_order: project.journey_order || 0,
        is_featured: !!project.is_featured,
      };
      const res = await api.put(`/projects/${projectId}`, payload);
      if (!res.data?.success) throw new Error("Save failed");
      const next = res.data.project;
      setProject(next);
      setSaved(next);
      setStatus("saved");
      onSaved?.({ id: projectId, project: next });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    try {
      const res = await api.get("/projects");
      const found = (res.data.projects || []).find(
        (p) => String(p.id) === String(projectId),
      );
      if (!found) throw new Error("Not found");
      setProject(found);
      setSaved(found);
      pushPreview(found);
      setStatus("discarded");
    } catch (error) {
      alert("Could not reload project.");
    }
  };

  const coverUrl =
    project?.images && project.images.length ? project.images[0] : "";

  if (loading || !project) {
    return (
      <div className="we-panel">
        <div className="we-panel__body">
          <p className="we-muted">Loading project…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="we-panel">
      <div className="we-panel__head">
        <div>
          <p className="we-panel__eyebrow">Editing project</p>
          <h2>{project.title || projectTitle}</h2>
          <code className="we-panel__key">project #{projectId}</code>
        </div>
        <button type="button" className="we-panel__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="we-panel__body">
        <p className="we-entity-note">
          Edits this journey panel — title, type/BHK, city, year, description and tags.
        </p>
        <div className="we-fields">
          <label className="we-field">
            <span>Title</span>
            <input
              className="we-input"
              value={project.title || ""}
              onChange={(e) => update({ title: e.target.value })}
            />
          </label>
          <label className="we-field">
            <span>Type / BHK (shown as Area)</span>
            <input
              className="we-input"
              value={project.project_type || ""}
              placeholder="e.g. 4 BHK Residence"
              onChange={(e) => update({ project_type: e.target.value })}
            />
          </label>
          <label className="we-field">
            <span>City</span>
            <input
              className="we-input"
              value={project.location || ""}
              onChange={(e) => update({ location: e.target.value })}
            />
          </label>
          <label className="we-field">
            <span>Year</span>
            <input
              className="we-input"
              type="number"
              value={project.year ?? ""}
              onChange={(e) => update({ year: e.target.value })}
            />
          </label>
          <label className="we-field">
            <span>Description</span>
            <textarea
              className="we-input we-textarea"
              rows={5}
              value={project.description || ""}
              onChange={(e) => update({ description: e.target.value })}
            />
          </label>
          <label className="we-field">
            <span>Material tags (comma separated)</span>
            <input
              className="we-input"
              value={tagsToString(project.material_tags)}
              onChange={(e) =>
                update({
                  material_tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <div className="we-image-card">
            <strong>Journey cover image</strong>
            {coverUrl && (
              <div
                className="we-image-thumb"
                style={{ backgroundImage: `url(${coverUrl})` }}
              />
            )}
            <CompactImageUploader
              label="Replace cover"
              onUpload={(url) => update({ images: [url, ...(project.images || []).slice(1)] })}
            />
          </div>
          <div className="we-image-card">
            <strong>Before image (transformation section)</strong>
            {project.before_image_url && (
              <div
                className="we-image-thumb"
                style={{ backgroundImage: `url(${project.before_image_url})` }}
              />
            )}
            <CompactImageUploader
              label="Replace before"
              onUpload={(url) => update({ before_image_url: url })}
            />
          </div>
          <div className="we-image-card">
            <strong>After image</strong>
            {project.after_image_url && (
              <div
                className="we-image-thumb"
                style={{ backgroundImage: `url(${project.after_image_url})` }}
              />
            )}
            <CompactImageUploader
              label="Replace after"
              onUpload={(url) => update({ after_image_url: url })}
            />
          </div>
        </div>
      </div>

      <div className="we-panel__foot">
        {status === "saved" && (
          <p className="we-status we-status--ok">Saved — live on Projects page.</p>
        )}
        {dirty && status !== "saved" && (
          <p className="we-status we-status--warn">Unsaved preview changes</p>
        )}
        <div className="we-panel__actions">
          <button type="button" className="we-btn we-btn--ghost" onClick={handleDiscard} disabled={saving}>
            Discard
          </button>
          <button
            type="button"
            className="we-btn we-btn--primary"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectEditorPanel;
