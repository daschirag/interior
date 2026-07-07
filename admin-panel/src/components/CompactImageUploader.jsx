import { useRef, useState } from "react";
import { getDimensionWarning, readImageDimensions } from "../utils/imageDimensionCheck";
import { imageKitErrorMessage, uploadToImageKit } from "../utils/imagekitUpload";

function CompactImageUploader({ onUpload, label, recommended }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dimensionWarning, setDimensionWarning] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 10 MB.");
      return;
    }

    setError("");
    setDimensionWarning("");
    setProgress(0);

    try {
      const dimensions = await readImageDimensions(file);
      const warning = getDimensionWarning(dimensions, recommended);
      if (warning) setDimensionWarning(warning);
    } catch {
      // Non-blocking — upload can proceed without dimension check.
    }

    try {
      setUploading(true);
      const url = await uploadToImageKit(file, {
        onProgress: setProgress,
      });
      onUpload(url);
      setProgress(100);
    } catch (err) {
      console.error(err);
      const message = imageKitErrorMessage(err);
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="we-image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        className="we-btn we-btn--ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? `Uploading… ${progress}%` : label || "Upload image"}
      </button>
      {uploading && (
        <div className="we-upload-progress" aria-hidden="true">
          <div className="we-upload-progress__bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {dimensionWarning && (
        <p className="we-upload-warning">{dimensionWarning}</p>
      )}
      {error && <p className="we-upload-error">{error}</p>}
    </div>
  );
}

export default CompactImageUploader;
