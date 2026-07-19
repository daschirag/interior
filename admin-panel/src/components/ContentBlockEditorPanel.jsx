import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import CompactImageUploader from "./CompactImageUploader";
import { formatIndiaDateTime } from "../utils/formatDateTime";
import {
  getHtmlFieldHint,
  sortContentFieldKeys,
} from "../utils/contentBlockFieldOrder";

function formatFieldLabel(key) {
  return key
    .replace(/_/g, " ")
    .replace(/ html$/i, " (HTML)")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isHtmlField(key) {
  return key.endsWith("_html") || key.includes("html");
}

function ContentBlockEditorPanel({
  sectionKey,
  sectionLabel,
  initialFields,
  initialImages,
  onPreview,
  onClose,
  onDirtyChange,
  onSaved,
}) {
  const [activeTab, setActiveTab] = useState("content");
  const [fields, setFields] = useState(initialFields || {});
  const [images, setImages] = useState(initialImages || []);
  const [savedFields, setSavedFields] = useState(initialFields || {});
  const [savedImages, setSavedImages] = useState(initialImages || []);
  const [history, setHistory] = useState([]);
  const [loadingBlock, setLoadingBlock] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const fieldKeys = useMemo(
    () => sortContentFieldKeys(Object.keys(fields)),
    [fields],
  );

  const dirty =
    JSON.stringify(fields) !== JSON.stringify(savedFields) ||
    JSON.stringify(images) !== JSON.stringify(savedImages);

  const pushPreview = useCallback(
    (nextFields, nextImages) => {
      onPreview({
        sectionKey,
        fields: nextFields,
        images: nextImages,
      });
    },
    [onPreview, sectionKey],
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    setFields(initialFields || {});
    setImages(initialImages || []);
    setSavedFields(initialFields || {});
    setSavedImages(initialImages || []);
    setActiveTab("content");
    setStatus("");
  }, [sectionKey, initialFields, initialImages]);

  useEffect(() => {
    if (!sectionKey) return;
    let cancelled = false;
    setLoadingBlock(true);
    api
      .get(`/content-blocks/${sectionKey}`)
      .then((res) => {
        if (cancelled || !res.data?.success) return;
        const block = res.data.block;
        const nextFields = block.fields || {};
        const nextImages = block.images || [];
        setFields(nextFields);
        setImages(nextImages);
        setSavedFields(nextFields);
        setSavedImages(nextImages);
        pushPreview(nextFields, nextImages);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingBlock(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sectionKey, pushPreview]);

  const loadHistory = useCallback(async () => {
    if (!sectionKey) return;
    setLoadingHistory(true);
    try {
      const res = await api.get(`/content-blocks/${sectionKey}/history`);
      if (res.data?.success) {
        console.log(
          "[History][content-block] raw edited_at from API:",
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
  }, [sectionKey]);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  const updateField = (key, value) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      setImages((currentImages) => {
        pushPreview(next, currentImages);
        return currentImages;
      });
      return next;
    });
  };

  const updateImage = (index, patch) => {
    setImages((prev) => {
      const next = prev.map((img, i) => (i === index ? { ...img, ...patch } : img));
      setFields((currentFields) => {
        pushPreview(currentFields, next);
        return currentFields;
      });
      return next;
    });
  };

  const applyBlockState = (block) => {
    const nextFields = block?.fields || {};
    let nextImages = [];
    if (Array.isArray(block?.images)) {
      nextImages = JSON.parse(JSON.stringify(block.images));
    } else if (typeof block?.images === "string" && block.images) {
      try {
        nextImages = JSON.parse(block.images);
      } catch {
        nextImages = [];
      }
    }
    setFields(nextFields);
    setImages(nextImages);
    setSavedFields(nextFields);
    setSavedImages(nextImages);
    pushPreview(nextFields, nextImages);
    return { nextFields, nextImages };
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");
    try {
      const res = await api.put(`/content-blocks/${sectionKey}`, {
        fields,
        images,
      });
      if (!res.data?.success) throw new Error("Save failed");
      const nextFields = { ...(res.data.block.fields || fields) };
      const nextImages = JSON.parse(JSON.stringify(res.data.block.images || images));
      setSavedFields(nextFields);
      setSavedImages(nextImages);
      setFields(nextFields);
      setImages(nextImages);
      pushPreview(nextFields, nextImages);
      setStatus("saved");
      onSaved?.({
        sectionKey,
        sectionLabel,
        fields: nextFields,
        images: nextImages,
      });
      if (activeTab === "history") loadHistory();
    } catch (error) {
      console.error(error);
      setStatus("error");
      alert(error.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (dirty && !window.confirm("Discard unsaved changes and reload saved content?")) {
      return;
    }
    try {
      const res = await api.get(`/content-blocks/${sectionKey}`);
      if (!res.data?.success) throw new Error("Fetch failed");
      applyBlockState(res.data.block);
      setStatus("discarded");
    } catch (error) {
      console.error(error);
      alert("Could not reload saved content.");
    }
  };

  const handleRestore = async (historyId) => {
    if (!window.confirm("Restore this version? Current content will be saved to history first.")) {
      return;
    }
    try {
      const res = await api.post(
        `/content-blocks/${sectionKey}/restore/${historyId}`,
      );
      if (!res.data?.success) throw new Error("Restore failed");
      const { nextFields, nextImages } = applyBlockState(res.data.block);
      setStatus("restored");
      onSaved?.({
        sectionKey,
        sectionLabel,
        fields: nextFields,
        images: nextImages,
        silent: true,
      });
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Restore failed.");
    }
  };

  const handleResetDefault = async () => {
    if (
      !window.confirm(
        "Reset this section to the current website original? Current state will be saved to history first.",
      )
    ) {
      return;
    }
    try {
      const res = await api.post(
        `/content-blocks/${sectionKey}/reset-to-default`,
      );
      if (!res.data?.success) throw new Error("Reset failed");
      const { nextFields, nextImages } = applyBlockState(res.data.block);
      setStatus("reset");
      onSaved?.({
        sectionKey,
        sectionLabel,
        fields: nextFields,
        images: nextImages,
        silent: true,
      });
      loadHistory();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Reset failed.");
    }
  };

  return (
    <div className="we-panel">
      <div className="we-panel__head">
        <div>
          <p className="we-panel__eyebrow">Editing section</p>
          <h2>{sectionLabel}</h2>
          <code className="we-panel__key">{sectionKey}</code>
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
          loadingBlock ? (
            <p className="we-muted">Loading section content…</p>
          ) : (
            <>
              <div className="we-fields">
                {fieldKeys.length === 0 ? (
                  <p className="we-muted">No editable text fields for this section.</p>
                ) : (
                  fieldKeys.map((key) => {
                    const htmlHint = getHtmlFieldHint(key);
                    return (
                      <label key={key} className="we-field">
                        <span>{formatFieldLabel(key)}</span>
                        {isHtmlField(key) || String(fields[key] || "").length > 80 ? (
                          <textarea
                            className="we-input we-textarea"
                            value={fields[key] ?? ""}
                            rows={
                              key === "statement_html"
                                ? 10
                                : isHtmlField(key)
                                  ? 5
                                  : 4
                            }
                            onChange={(e) => updateField(key, e.target.value)}
                          />
                        ) : (
                          <input
                            className="we-input"
                            type="text"
                            value={fields[key] ?? ""}
                            onChange={(e) => updateField(key, e.target.value)}
                          />
                        )}
                        {htmlHint && <p className="we-field-hint">{htmlHint}</p>}
                      </label>
                    );
                  })
                )}
              </div>

              {images.length > 0 && (
                <div className="we-images">
                  <h3>Images</h3>
                  {images.map((img, index) => (
                    <div key={img.key || index} className="we-image-card">
                      <div className="we-image-card__top">
                        <strong>{img.label || img.key}</strong>
                        <span className="we-image-card__key">{img.key}</span>
                      </div>
                      {img.url && (
                        <div
                          className="we-image-thumb"
                          style={{ backgroundImage: `url(${img.url})` }}
                        />
                      )}
                      <CompactImageUploader
                        label={img.url ? "Replace image" : "Add image"}
                        recommended={img.recommended}
                        onUpload={(url) => updateImage(index, { url })}
                      />
                      {img.recommended && (
                        <p className="we-image-hint">
                          Recommended: {img.recommended}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )
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
                  "[History][content-block] formatting edited_at:",
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
              Reset to current website original
            </button>
          </div>
        )}
      </div>

      <div className="we-panel__foot">
        {status === "saved" && (
          <p className="we-status we-status--ok">
            Saved — this is now live for all visitors.
          </p>
        )}
        {status === "restored" && (
          <p className="we-status we-status--ok">Version restored and saved.</p>
        )}
        {status === "reset" && (
          <p className="we-status we-status--ok">Reset to current website original.</p>
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
            disabled={saving || loadingBlock}
          >
            Discard
          </button>
          <button
            type="button"
            className="we-btn we-btn--primary"
            onClick={handleSave}
            disabled={saving || loadingBlock || !dirty}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContentBlockEditorPanel;
