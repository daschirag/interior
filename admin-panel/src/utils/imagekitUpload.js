import axios from "axios";
import api from "../services/api";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

function imageKitErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((e) => e?.message || String(e)).join("; ");
  }
  return error?.message || "Upload failed.";
}

/**
 * Browser → ImageKit direct upload (file never hits our backend).
 */
export async function uploadToImageKit(file, { onProgress, folder = "interior-cms" } = {}) {
  const authRes = await api.get("/upload-auth");
  if (!authRes.data?.success) {
    throw new Error(authRes.data?.message || "Could not get upload credentials.");
  }

  const { token, expire, signature, publicKey } = authRes.data;
  if (!token || !expire || !signature || !publicKey) {
    throw new Error("Upload credentials were incomplete. Check ImageKit env vars on the backend.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", publicKey);
  formData.append("signature", signature);
  formData.append("expire", String(expire));
  formData.append("token", token);
  if (folder) formData.append("folder", folder);

  const uploadRes = await axios.post(IMAGEKIT_UPLOAD_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded * 100) / event.total));
    },
  });

  const url = uploadRes.data?.url;
  if (!url) {
    throw new Error("ImageKit did not return an image URL.");
  }

  return url;
}

export { imageKitErrorMessage };
