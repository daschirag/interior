import { useRef, useState } from "react";
import { imageKitErrorMessage, uploadToImageKit } from "../utils/imagekitUpload";

function ImageUploader({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const fileInputRef = useRef();

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please choose an image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setProgress(0);

      const url = await uploadToImageKit(selectedFile, {
        onProgress: setProgress,
      });

      onUpload(url);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setError(imageKitErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div
        style={{
          border: "2px dashed #3d4354",
          borderRadius: "12px",
          padding: "50px 30px",
          textAlign: "center",
          background: "#1f232d",
        }}
      >
        <h3
          style={{
            color: "#fff",
            marginBottom: "12px",
            fontSize: "28px",
            fontWeight: "400",
          }}
        >
          Upload Image
        </h3>

        <p
          style={{
            color: "#9ea7b8",
            marginBottom: "30px",
          }}
        >
          Uploads go directly to ImageKit (not through the API server)
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            setSelectedFile(e.target.files[0] || null);
            setError("");
          }}
        />

        <button
          className="primary-btn"
          onClick={() => fileInputRef.current.click()}
        >
          Choose Image
        </button>

        {selectedFile && (
          <div
            style={{
              marginTop: "25px",
              color: "#fff",
              fontSize: "15px",
            }}
          >
            Selected File
            <br />
            <span
              style={{
                color: "#5fb7ff",
              }}
            >
              {selectedFile.name}
            </span>
          </div>
        )}

        <button
          className="primary-btn"
          style={{
            marginTop: "30px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? `Uploading… ${progress}%` : "Upload Image"}
        </button>

        {error && (
          <p style={{ color: "#f5a8a8", marginTop: "16px", fontSize: "14px" }}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}

export default ImageUploader;
