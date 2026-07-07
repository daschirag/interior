import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import api from "../services/api";
import { formatIST } from "../utils/formatDateTime";
import "../styles/admin.css";
import "../styles/mediaLibrary.css";

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

function usageLabel(ref) {
  const typeLabels = {
    content_block: "Section",
    project: "Project",
    discipline: "Discipline",
    studio: "Studio",
  };
  const prefix = typeLabels[ref.type] || ref.type;
  return `${prefix}: ${ref.label}`;
}

function StorageBar({ usage }) {
  if (!usage) return null;

  const percent = Math.min(100, Number(usage.percentUsed) || 0);
  const usedGb = usage.storageGb ?? 0;
  const limitGb = usage.storageLimitGb ?? 3;
  const warn = percent >= 80;

  return (
    <div className="ml-storage">
      <div className="ml-storage__head">
        <strong>ImageKit storage</strong>
        <span>
          {usedGb} GB of {limitGb} GB used ({percent}%)
        </span>
      </div>
      <div className="ml-storage__track" aria-hidden="true">
        <div
          className={`ml-storage__fill ${warn ? "ml-storage__fill--warn" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="ml-storage__hint">
        Files in the <code>interior-cms</code> folder. Delete unused images to free space.
      </p>
    </div>
  );
}

function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unusedOnly, setUnusedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("date-desc");
  const [deletingId, setDeletingId] = useState(null);
  const [status, setStatus] = useState("");

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [libRes, usageRes] = await Promise.all([
        api.get("/media-library"),
        api.get("/media-library/usage"),
      ]);

      if (!libRes.data?.success) {
        throw new Error(libRes.data?.message || "Could not load media library");
      }

      setFiles(libRes.data.files || []);

      if (usageRes.data?.success) {
        setUsage(usageRes.data.usage);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load media library");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const displayedFiles = useMemo(() => {
    let list = [...files];

    if (unusedOnly) {
      list = list.filter((f) => !f.isUsed);
    }

    list.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      }
      if (sortBy === "date-asc") {
        return new Date(a.uploadedAt) - new Date(b.uploadedAt);
      }
      if (sortBy === "size-desc") {
        return (b.size || 0) - (a.size || 0);
      }
      if (sortBy === "size-asc") {
        return (a.size || 0) - (b.size || 0);
      }
      return 0;
    });

    return list;
  }, [files, unusedOnly, sortBy]);

  const totalSize = useMemo(
    () => files.reduce((sum, f) => sum + (f.size || 0), 0),
    [files],
  );

  const handleDelete = async (file) => {
    const usedIn = file.usedIn || [];
    let message;

    if (usedIn.length > 0) {
      const places = usedIn.map((ref) => `• ${usageLabel(ref)}`).join("\n");
      message =
        `This image is currently used in ${usedIn.length} place(s):\n\n${places}\n\n` +
        "Deleting it will break those images on the live site.\n\n" +
        "Are you sure you want to permanently delete this file from ImageKit?";
    } else {
      message = `Permanently delete "${file.name}" from ImageKit? This cannot be undone.`;
    }

    if (!window.confirm(message)) return;

    setDeletingId(file.fileId);
    setStatus("");

    try {
      const url = usedIn.length
        ? `/media-library/${file.fileId}?confirm=true`
        : `/media-library/${file.fileId}`;

      const res = await api.delete(url);
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Delete failed");
      }

      setFiles((prev) => prev.filter((f) => f.fileId !== file.fileId));
      setStatus(`Deleted "${file.name}"`);
      const usageRes = await api.get("/media-library/usage");
      if (usageRes.data?.success) {
        setUsage(usageRes.data.usage);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409 && err.response?.data?.usedIn) {
        const places = err.response.data.usedIn
          .map((ref) => `• ${usageLabel(ref)}`)
          .join("\n");
        alert(
          `Still in use:\n\n${places}\n\nRemove it from those sections first, or confirm deletion again.`,
        );
      } else {
        alert(err.response?.data?.message || "Could not delete file.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Media Library"
        subtitle="Browse and manage images stored in ImageKit. See where each file is used before deleting."
        buttonText="Refresh"
        onButtonClick={loadLibrary}
      />

      <StorageBar usage={usage} />

      <div className="ml-toolbar table-card">
        <div className="ml-toolbar__left">
          <label className="ml-filter">
            <input
              type="checkbox"
              checked={unusedOnly}
              onChange={(e) => setUnusedOnly(e.target.checked)}
            />
            <span>Unused only</span>
          </label>
          <label className="ml-sort">
            <span>Sort by</span>
            <select
              className="ml-sort__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Upload date (newest)</option>
              <option value="date-asc">Upload date (oldest)</option>
              <option value="size-desc">File size (largest)</option>
              <option value="size-asc">File size (smallest)</option>
            </select>
          </label>
        </div>
        <div className="ml-toolbar__meta">
          <span>{displayedFiles.length} shown</span>
          <span>{files.length} total</span>
          <span>{formatBytes(totalSize)} in folder</span>
        </div>
      </div>

      {status && <p className="ml-status ml-status--ok">{status}</p>}
      {error && <p className="ml-status ml-status--err">{error}</p>}

      {loading ? (
        <p className="ml-empty">Loading media library…</p>
      ) : displayedFiles.length === 0 ? (
        <p className="ml-empty table-card">
          {unusedOnly
            ? "No unused images — all files are referenced on the site."
            : "No images found in the interior-cms folder."}
        </p>
      ) : (
        <div className="ml-grid">
          {displayedFiles.map((file) => (
            <article key={file.fileId} className="ml-card">
              <div className="ml-card__thumb-wrap">
                <img
                  src={file.thumbnailUrl || file.url}
                  alt={file.name}
                  className="ml-card__thumb"
                  loading="lazy"
                />
                {file.isUsed ? (
                  <span className="ml-card__badge ml-card__badge--used">In use</span>
                ) : (
                  <span className="ml-card__badge ml-card__badge--unused">Unused</span>
                )}
              </div>

              <div className="ml-card__body">
                <h3 className="ml-card__name" title={file.name}>
                  {file.name}
                </h3>
                <p className="ml-card__meta">
                  {formatBytes(file.size)}
                  {file.uploadedAt && (
                    <>
                      {" · "}
                      {formatIST(file.uploadedAt)}
                    </>
                  )}
                </p>

                {file.usedIn?.length > 0 && (
                  <ul className="ml-card__tags">
                    {file.usedIn.map((ref) => (
                      <li key={`${ref.type}-${ref.id}-${ref.field}`}>
                        {usageLabel(ref)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="ml-card__actions">
                  <a
                    className="ml-card__link"
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    className="action-btn delete-btn ml-card__delete"
                    disabled={deletingId === file.fileId}
                    onClick={() => handleDelete(file)}
                  >
                    {deletingId === file.fileId ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default MediaLibrary;
