const cloudinary = require("../config/cloudinary");
const { configureCloudinary } = require("../config/cloudinary");
const {
  extractCloudinaryError,
  configFingerprint,
} = require("../utils/cloudinaryError");

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const testCloudinary = async (req, res) => {
  configureCloudinary();

  const probeUpload = req.query.upload === "1" || req.query.probe === "upload";
  const config = configFingerprint();

  try {
    const ping = await cloudinary.api.ping();

    const response = {
      success: true,
      config,
      ping,
      note:
        "Ping checks Admin API only. Upload uses a separate signed Upload API — use ?upload=1 to probe upload with the same SDK path as POST /api/upload.",
    };

    if (probeUpload) {
      try {
        const upload = await cloudinary.uploader.upload(TINY_PNG, {
          folder: "interior-cms",
          resource_type: "image",
        });
        response.upload = {
          success: true,
          public_id: upload.public_id,
          secure_url: upload.secure_url,
        };
      } catch (uploadError) {
        const cloudinaryError = extractCloudinaryError(uploadError);
        console.error("[GET /api/cloudinary-test?upload=1] probe failed:", {
          config,
          cloudinaryError,
        });
        response.upload = {
          success: false,
          cloudinaryError,
        };
        response.success = false;
      }
    }

    res.status(response.success ? 200 : 500).json(response);
  } catch (error) {
    const cloudinaryError = extractCloudinaryError(error);
    console.error("[GET /api/cloudinary-test] ping failed:", {
      config,
      cloudinaryError,
    });

    res.status(500).json({
      success: false,
      config,
      cloudinaryError,
      message: cloudinaryError.message,
    });
  }
};

module.exports = {
  testCloudinary,
};
