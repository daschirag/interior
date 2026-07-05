const cloudinary = require("../config/cloudinary");
const { configureCloudinary } = require("../config/cloudinary");
const {
  extractCloudinaryError,
  configFingerprint,
} = require("../utils/cloudinaryError");

function cloudinaryHint(details) {
  const code = details?.http_code;
  const message = details?.message || "";

  if (
    code === 403 ||
    code === 401 ||
    message.includes("unsigned") ||
    message.includes("Invalid Signature") ||
    message.includes("disabled")
  ) {
    return (
      " Ping (/api/cloudinary-test) only checks Admin API reachability. Upload uses a signed Upload API request — " +
      "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be an exact pair from the same row in Cloudinary → Settings → API Keys."
    );
  }

  return "";
}

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    // Re-apply env on each request so a stale process can't use old placeholders.
    configureCloudinary();

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in interior-backend/.env, then restart the backend.",
        config: configFingerprint(),
      });
    }

    if (
      CLOUDINARY_CLOUD_NAME === "placeholder" ||
      CLOUDINARY_API_KEY === "placeholder" ||
      CLOUDINARY_API_SECRET === "placeholder"
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Cloudinary still uses placeholder values in .env. Add your real credentials and restart the backend.",
        config: configFingerprint(),
      });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Signed upload: SDK signs with api_secret from configureCloudinary() above.
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "interior-cms",
      resource_type: "image",
    });

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    const cloudinaryError = extractCloudinaryError(error);
    const hint = cloudinaryHint(cloudinaryError);
    const message = cloudinaryError.message + hint;

    console.error("[POST /api/upload] Cloudinary upload failed:", {
      file: req.file
        ? {
            mimetype: req.file.mimetype,
            size: req.file.size,
            originalname: req.file.originalname,
          }
        : null,
      config: configFingerprint(),
      cloudinaryError,
    });

    const status =
      cloudinaryError.http_code &&
      cloudinaryError.http_code >= 400 &&
      cloudinaryError.http_code < 600
        ? cloudinaryError.http_code
        : 500;

    res.status(status).json({
      success: false,
      message,
      cloudinaryError,
      config: configFingerprint(),
    });
  }
};

module.exports = {
  uploadImage,
};
