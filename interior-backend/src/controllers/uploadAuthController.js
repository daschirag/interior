const { getImageKit } = require("../config/imagekit");

const getUploadAuth = (req, res) => {
  try {
    const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } =
      process.env;

    if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
      return res.status(500).json({
        success: false,
        message:
          "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env, then restart the backend.",
      });
    }

    const imagekit = getImageKit();
    if (!imagekit) {
      return res.status(500).json({
        success: false,
        message: "ImageKit client could not be initialized.",
      });
    }

    const { token, expire, signature } = imagekit.getAuthenticationParameters();

    res.json({
      success: true,
      token,
      expire,
      signature,
      publicKey: IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error("[GET /api/upload-auth] ImageKit auth failed:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Could not generate upload credentials.",
    });
  }
};

module.exports = {
  getUploadAuth,
};
