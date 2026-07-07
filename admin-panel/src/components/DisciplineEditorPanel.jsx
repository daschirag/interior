import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import CompactImageUploader from "./CompactImageUploader";
import { formatIndiaDateTime } from "../utils/formatDateTime";

function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function DisciplineEditorPanel({
  disciplineId,
  disciplineTitle,
  onPreview,
  onSaved,
  onDirtyChange,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("content");
  const [discipline, setDiscipline] = useState(null);
  const [saved, setSaved] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const dirty =
    discipline && saved && JSON.stringify(discipline) !== JSON.stringify(saved);

  const pushPreview = useCallback(
    (next) => {
      onPreview({ id: disciplineId, discipline: next });
    },
    [disciplineId, onPreview],
  );

  const applyDisciplineState = useCallback(
    (next) => {
      const cloned = JSON.parse(JSON.stringify(next));
      setDiscipline(cloned);
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
      .get("/disciplines")
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const found = (res.data.disciplines || []).find(
          (d) => String(d.id) === String(disciplineId),
        );
        if (!found) return;
        applyDisciplineState(found);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [disciplineId, applyDisciplineState]);

  const loadHistory = useCallback(async () => {
    if (!disciplineId) return;
    setLoadingHistory(true);
    try {
      const res = await api.get(`/disciplines/${disciplineId}/history`);
      if (res.data?.success) {
        console.log(
          "[History][discipline] raw edited_at from API:",
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
  }, [disciplineId]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  const update = (patch) => {
    setDiscipline((prev) => {
      const next = { ...prev, ...patch };
      pushPreview(next);
      return next;
    });
  };

  const handleSave = async () => {
    if (!discipline) return;
    setSaving(true);
    setStatus("");
    try {
      const payload = {
        title: discipline.title,
        slug: discipline.slug,
        display_order: discipline.display_order || 0,
        subtitle: discipline.subtitle || "",
        headline: discipline.headline || "",
        description: discipline.description || "",
        budget_range: discipline.budget_range || "",
        timeline: discipline.timeline || "",
        scope: discipline.scope || "",
        tags: discipline.tags || [],
        image_url: discipline.image_url || "",
        cta_projects_link: discipline.cta_projects_link || "",
        cta_consult_link: discipline.cta_consult_link || "",
      };
      const res = await api.put(`/disciplines/${disciplineId}`, payload);
      if (!res.data?.success) throw new Error("Save failed");
      const next = applyDisciplineState(res.data.discipline);
      setStatus("saved");
      onSaved?.({ id: disciplineId, discipline: next });
      if (activeTab === "history") loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not save discipline.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (dirty && !window.confirm("Discard unsaved changes and reload saved content?")) {
      return;
    }
    try {
      const res = await api.get("/disciplines");
      const found = (res.data.disciplines || []).find(
        (d) => String(d.id) === String(disciplineId),
      );
      if (!found) throw new Error("Not found");
      applyDisciplineState(found);
      setStatus("discarded");
    } catch (error) {
      alert("Could not reload discipline.");
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
        `/disciplines/${disciplineId}/restore/${historyId}`,
      );
      if (!res.data?.success) throw new Error("Restore failed");
      const next = applyDisciplineState(res.data.discipline);
      setStatus("restored");
      onSaved?.({ id: disciplineId, discipline: next, silent: true });
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Restore failed.");
    }
  };

  const handleResetDefault = async () => {
    if (
      !window.confirm(
        "Reset this discipline to its originally seeded content? Current state will be saved to history first.",
      )
    ) {
      return;
    }
    try {
      const res = await api.post(`/disciplines/${disciplineId}/reset-to-default`);
      if (!res.data?.success) throw new Error("Reset failed");
      const next = applyDisciplineState(res.data.discipline);
      setStatus("reset");
      onSaved?.({ id: disciplineId, discipline: next, silent: true });
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Reset failed.");
    }
  };

  if (loading || !discipline) {
    return (
      <div className="we-panel">
        <div className="we-panel__body">
          <p className="we-muted">Loading discipline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="we-panel">
      <div className="we-panel__head">
        <div>
          <p className="we-panel__eyebrow">Editing discipline</p>
          <h2>{discipline.title || disciplineTitle}</h2>
          <code className="we-panel__key">discipline #{disciplineId}</code>
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
              Edits the list row and expand panel (budget in lacs, timeline, scope, tags).
            </p>
            <div className="we-fields">
              <label className="we-field">
                <span>Title (list row)</span>
                <input
                  className="we-input"
                  value={discipline.title || ""}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Subtitle (row meta + expand kicker)</span>
                <input
                  className="we-input"
                  value={discipline.subtitle || ""}
                  onChange={(e) => update({ subtitle: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Headline (HTML, expand title)</span>
                <textarea
                  className="we-input we-textarea"
                  rows={4}
                  value={discipline.headline || ""}
                  onChange={(e) => update({ headline: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Description</span>
                <textarea
                  className="we-input we-textarea"
                  rows={4}
                  value={discipline.description || ""}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Budget range (e.g. ₹1.5L – ₹2L)</span>
                <input
                  className="we-input"
                  value={discipline.budget_range || ""}
                  onChange={(e) => update({ budget_range: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Timeline</span>
                <input
                  className="we-input"
                  value={discipline.timeline || ""}
                  onChange={(e) => update({ timeline: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Scope</span>
                <input
                  className="we-input"
                  value={discipline.scope || ""}
                  onChange={(e) => update({ scope: e.target.value })}
                />
              </label>
              <label className="we-field">
                <span>Feature tags (comma separated)</span>
                <input
                  className="we-input"
                  value={tagsToString(discipline.tags)}
                  onChange={(e) =>
                    update({
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <div className="we-image-card">
                <strong>Discipline image</strong>
                {discipline.image_url && (
                  <div
                    className="we-image-thumb"
                    style={{ backgroundImage: `url(${discipline.image_url})` }}
                  />
                )}
                <CompactImageUploader
                  label="Replace image"
                  onUpload={(url) => update({ image_url: url })}
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
                  "[History][discipline] formatting edited_at:",
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
          <p className="we-status we-status--ok">Saved — live on Services page.</p>
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

export default DisciplineEditorPanel;
