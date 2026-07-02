import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import ImageUploader from "../components/ImageUploader";
import "../styles/admin.css";

function Uploads() {
  const [uploadedUrl, setUploadedUrl] = useState("");

  return (
    <AdminLayout>
      <PageHeader
        title="Uploads"
        subtitle="Upload images to Cloudinary and copy their URLs."
      />

      <div
        className="table-card"
        style={{
          padding: "35px",
          maxWidth: "850px",
        }}
      >
        <ImageUploader
          onUpload={(url) => setUploadedUrl(url)}
        />

        {uploadedUrl && (
          <>
            <h2
              style={{
                marginTop: "35px",
                marginBottom: "20px",
                color: "#ffffff",
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: "32px",
                fontWeight: "400",
              }}
            >
              Uploaded Image
            </h2>

            <img
              src={uploadedUrl}
              alt="Uploaded"
              style={{
                width: "100%",
                maxWidth: "450px",
                borderRadius: "12px",
                border: "1px solid #313847",
                display: "block",
              }}
            />

            <input
              className="admin-input"
              value={uploadedUrl}
              readOnly
              style={{
                marginTop: "25px",
              }}
            />

            <button
              className="primary-btn"
              style={{
                marginTop: "15px",
              }}
              onClick={() => {
                navigator.clipboard.writeText(uploadedUrl);
                alert("Image URL copied!");
              }}
            >
              Copy URL
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default Uploads;