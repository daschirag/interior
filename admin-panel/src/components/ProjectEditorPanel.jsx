import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import CompactImageUploader from "./CompactImageUploader";
import { formatIndiaDateTime } from "../utils/formatDateTime";

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
  const [activeTab, setActiveTab] = useState("content");
  const [project, setProject] = useState(null);
  const [saved, setSaved] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const dirty = project && saved && JSON.stringify(project) !== JSON.stringify(saved);

  const pushPreview = useCallback(
    (next) => {
      onPreview({ id: projectId, project: next });
    },
    [projectId, onPreview],
  );

  const applyProjectState = useCallback(
    (next) => {
      const cloned = JSON.parse(JSON.stringify(next));
      setProject(cloned);
      setSaved(cloned);
      pushPreview(cloned);
      return cloned;
    },
    [pushPreview],
  );

  useEffect(() => {
    onDirtyChange?.(!!dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatus("");
    setActiveTab("content");

    api
      .get("/projects")
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const found = (res.data.projects || []).find(
          (p) => String(p.id) === String(projectId),
        );
        if (!found) return;
        applyProjectState(found);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, applyProjectState]);

  const loadHistory = useCallback(async () => {
    if (!projectId) return;
    setLoadingHistory(true);
    try {
      const res = await api.get(`/projects/${projectId}/history`);
      if (res.data?.success) {
        console.log(
          "[History][project] raw edited_at from API:",
          (res.data.history || []).map((entry) => ({
            id: entry.id,
            edited_at: entry.edited_at,
            typeof: typeof entry.edited_at,
          })),
        );
        setHistory(res.data.history || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

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
        journey_order: project.journey_order || 0,
        is_featured: !!project.is_featured,
      };
      const res = await api.put(`/projects/${projectId}`, payload);
      if (!res.data?.success) throw new Error("Save failed");
      const next = applyProjectState(res.data.project);
      setStatus("saved");
      onSaved?.({ id: projectId, project: next });
      if (activeTab === "history") loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (dirty && !window.confirm("Discard unsaved changes and reload saved content?")) {
      return;
    }
    try {
      const res = await api.get("/projects");
      const found = (res.data.projects || []).find(
        (p) => String(p.id) === String(projectId),
      );
      if (!found) throw new Error("Not found");
      applyProjectState(found);
      setStatus("discarded");
    } catch (error) {
      alert("Could not reload project.");
    }
  };

  const handleRestore = async (historyId) => {
    if (
      !window.confirm(
        "Restore this version? Current content will be saved to history first.",
      )
    ) {
      return;
    }
    try {
      const res = await api.post(
        `/projects/${projectId}/restore/${historyId}`,
      );
      if (!res.data?.success) throw new Error("Restore failed");
      const next = applyProjectState(res.data.project);
      setStatus("restored");
      onSaved?.({ id: projectId, project: next, silent: true });
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Restore failed.");
    }
  };

  const handleResetDefault = async () => {
    if (
      !window.confirm(
        "Reset this project to its originally seeded content? Current state will be saved to history first.",
      )
    ) {
      return;
    }
    try {
      const res = await api.post(`/projects/${projectId}/reset-to-default`);
      if (!res.data?.success) throw new Error("Reset failed");
      const next = applyProjectState(res.data.project);
      setStatus("reset");
      onSaved?.({ id: projectId, project: next, silent: true });
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Reset failed.");
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

      <div className="we-tabs">
        <button
          type="button"
          className={activeTab === "content" ? "active" : ""}
          onClick={() => setActiveTab("content")}
        >
          Content
        </button>
        <button
          type="button"
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      <div className="we-panel__body">
        {activeTab === "content" ? (
          <>
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
            </div>

            <div className="we-images">
              <h3>Images</h3>
              <p className="we-muted">
                Journey cover and gallery images for this project panel.
              </p>
              <div className="we-image-card">
                <strong>Journey cover image</strong>
                {coverUrl && (
                  <div
                    className="we-image-thumb"
                    style={{ backgroundImage: `url(${coverUrl})` }}
                  />
                )}
                <CompactImageUploader
                  label={coverUrl ? "Replace image" : "Add image"}
                  recommended="1920x1080, landscape"
                  onUpload={(url) =>
                    update({ images: [url, ...(project.images || []).slice(1)] })
                  }
                />
              </div>
              {(project.images || []).slice(1).map((url, index) => (
                <div key={`gallery-${index}`} className="we-image-card">
                  <strong>Gallery image {index + 1}</strong>
                  {url && (
                    <div
                      className="we-image-thumb"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  )}
                  <CompactImageUploader
                    label={url ? "Replace image" : "Add image"}
                    recommended="1920x1080, landscape"
                    onUpload={(nextUrl) => {
                      const next = [...(project.images || [])];
                      next[index + 1] = nextUrl;
                      update({ images: next.filter(Boolean) });
                    }}
                  />
                </div>
              ))}
              <div className="we-image-card">
                <strong>Add another image</strong>
                <CompactImageUploader
                  label="Add image"
                  recommended="1920x1080, landscape"
                  onUpload={(url) =>
                    update({ images: [...(project.images || []), url] })
                  }
                />
              </div>
            </div>
          </>
        ) : (
          <div className="we-history">
            <p className="we-history-tz">All times shown in India Standard Time (IST).</p>
            {loadingHistory ? (
              <p className="we-muted">Loading history…</p>
            ) : history.length === 0 ? (
              <p className="we-muted">No saved versions yet. Save a change to create history.</p>
            ) : (
              history.map((entry) => {
                console.log(
                  "[History][project] formatting edited_at:",
                  entry.edited_at,
                );
                return (
                <div key={entry.id} className="we-history-item">
                  <div>
                    <strong>{formatIndiaDateTime(entry.edited_at)}</strong>
                    <p className="we-muted">
                      {entry.edited_by || "Unknown editor"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="we-btn we-btn--ghost"
                    onClick={() => handleRestore(entry.id)}
                  >
                    Restore
                  </button>
                </div>
                );
              })
            )}

            <button
              type="button"
              className="we-btn we-btn--danger-outline"
              onClick={handleResetDefault}
            >
              Reset to original seeded content
            </button>
          </div>
        )}
      </div>

      <div className="we-panel__foot">
        {status === "saved" && (
          <p className="we-status we-status--ok">Saved — live on Projects page.</p>
        )}
        {status === "restored" && (
          <p className="we-status we-status--ok">Version restored and saved.</p>
        )}
        {status === "reset" && (
          <p className="we-status we-status--ok">Reset to originally seeded content.</p>
        )}
        {status === "discarded" && (
          <p className="we-status">Discarded unsaved changes.</p>
        )}
        {dirty && status !== "saved" && (
          <p className="we-status we-status--warn">Unsaved preview changes</p>
        )}
        <div className="we-panel__actions">
          <button
            type="button"
            className="we-btn we-btn--ghost"
            onClick={handleDiscard}
            disabled={saving}
          >
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
