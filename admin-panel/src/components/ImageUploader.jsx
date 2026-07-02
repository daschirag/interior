import { useRef, useState } from "react";
import api from "../services/api";

function ImageUploader({ onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef();

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please choose an image.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUpload(response.data.imageUrl);

      alert("Image uploaded successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Upload failed."
      );
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
          Upload images to Cloudinary
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) =>
            setSelectedFile(e.target.files[0])
          }
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
          {uploading
            ? "Uploading..."
            : "Upload Image"}
        </button>
      </div>
    </>
  );
}

export default ImageUploader;