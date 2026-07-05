/**
 * Normalize Cloudinary SDK / HTTP errors into a safe, loggable payload.
 * Never includes api_secret or file data.
 */
function extractCloudinaryError(error) {
  if (!error) {
    return {
      message: "Unknown upload error",
      http_code: null,
      name: null,
      cloudinary: null,
      raw: null,
      sdk: null,
    };
  }

  const nested =
    error.error && typeof error.error === "object"
      ? { ...error.error }
      : typeof error.error === "string"
        ? { message: error.error }
        : null;

  const message =
    nested?.message ||
    error.message ||
    (typeof error === "string" ? error : "Upload failed");

  const http_code =
    error.http_code ?? error.status ?? error.statusCode ?? nested?.http_code ?? null;

  const payload = {
    message,
    http_code,
    name: error.name ?? null,
    cloudinary: nested,
    raw: null,
    sdk: null,
  };

  // Some SDK versions attach response body text for UnexpectedResponse errors.
  const response = error.response;
  if (response) {
    if (response.body) {
      payload.raw =
        typeof response.body === "string"
          ? response.body
          : { ...response.body };
    } else if (response.text) {
      payload.raw = response.text;
    } else if (response.error) {
      payload.raw = response.error;
    }
  }

  try {
    payload.sdk = JSON.parse(
      JSON.stringify(error, (key, value) => {
        if (key === "request" || key === "config" || key === "agent") {
          return undefined;
        }
        return value;
      }),
    );
  } catch {
    payload.sdk = {
      message: error.message,
      name: error.name,
      http_code: error.http_code,
    };
  }

  return payload;
}

function configFingerprint() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

  return {
    cloud_name: cloudName || null,
    api_key_suffix: apiKey ? apiKey.slice(-4) : null,
    api_key_length: apiKey.length,
    api_secret_set: apiSecret.length > 0,
    api_secret_length: apiSecret.length,
    placeholders:
      cloudName === "placeholder" ||
      apiKey === "placeholder" ||
      apiSecret === "placeholder",
  };
}

module.exports = {
  extractCloudinaryError,
  configFingerprint,
};
