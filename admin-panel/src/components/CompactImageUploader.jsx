import { useRef, useState } from "react";
import api from "../services/api";

function CompactImageUploader({ onUpload, label }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Maximum size is 5 MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("image", file);
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data?.imageUrl) {
        throw new Error(response.data?.message || "Upload failed — no image URL returned.");
      }

      onUpload(response.data.imageUrl);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const message =
        data?.message ||
        data?.cloudinaryError?.message ||
        err.message ||
        "Upload failed.";
      setError(message);
      alert(message);
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
        {uploading ? "Uploading…" : label || "Upload image"}
      </button>
      {error && <p className="we-upload-error">{error}</p>}
    </div>
  );
}

export default CompactImageUploader;
