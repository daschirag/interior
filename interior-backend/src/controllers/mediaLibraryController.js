const { getImageKit } = require("../config/imagekit");
const {
  CMS_FOLDER,
  buildImageReferenceIndex,
  lookupImageUsages,
} = require("../services/imageReferenceIndex");

const STORAGE_LIMIT_BYTES = 3 * 1024 * 1024 * 1024;

function requireImageKit(res) {
  const imagekit = getImageKit();
  if (!imagekit) {
    res.status(503).json({
      success: false,
      message:
        "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT.",
    });
    return null;
  }
  return imagekit;
}

async function listAllCmsFiles(imagekit) {
  const all = [];
  let skip = 0;
  const limit = 100;

  while (true) {
    const batch = await imagekit.listFiles({
      path: CMS_FOLDER,
      limit,
      skip,
    });

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    for (const item of batch) {
      if (item.type === "file") {
        all.push(item);
      }
    }

    if (batch.length < limit) {
      break;
    }

    skip += limit;
  }

  return all;
}

function mapFileRecord(file, usages) {
  return {
    fileId: file.fileId,
    name: file.name,
    url: file.url,
    thumbnailUrl: file.thumbnail || file.url,
    size: file.size || 0,
    uploadedAt: file.createdAt || file.updatedAt || null,
    filePath: file.filePath || null,
    mime: file.mime || null,
    width: file.width || null,
    height: file.height || null,
    usedIn: usages,
    isUsed: usages.length > 0,
  };
}

const listMediaLibrary = async (req, res) => {
  try {
    const imagekit = requireImageKit(res);
    if (!imagekit) return;

    const [files, referenceIndex] = await Promise.all([
      listAllCmsFiles(imagekit),
      buildImageReferenceIndex(),
    ]);

    const items = files.map((file) =>
      mapFileRecord(
        file,
        lookupImageUsages(referenceIndex, {
          url: file.url,
          filePath: file.filePath,
          name: file.name,
        }),
      ),
    );

    res.json({
      success: true,
      folder: CMS_FOLDER,
      count: items.length,
      files: items,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to list media library files",
    });
  }
};

const getMediaUsage = async (req, res) => {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
      return res.status(503).json({
        success: false,
        message: "ImageKit is not configured",
      });
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const format = (d) => d.toISOString().slice(0, 10);
    const url = `https://api.imagekit.io/v1/accounts/usage?startDate=${format(start)}&endDate=${format(end)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || `ImageKit usage API returned ${response.status}`);
    }

    const usage = await response.json();
    const usedBytes = Number(usage.mediaLibraryStorageBytes || 0);

    res.json({
      success: true,
      usage: {
        storageBytes: usedBytes,
        storageLimitBytes: STORAGE_LIMIT_BYTES,
        storageGb: Number((usedBytes / (1024 ** 3)).toFixed(3)),
        storageLimitGb: 3,
        percentUsed: Number(((usedBytes / STORAGE_LIMIT_BYTES) * 100).toFixed(2)),
        bandwidthBytes: Number(usage.bandwidthBytes || 0),
        periodStart: format(start),
        periodEnd: format(end),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ImageKit usage",
    });
  }
};

const getFileUsageCheck = async (req, res) => {
  try {
    const imagekit = requireImageKit(res);
    if (!imagekit) return;

    const file = await imagekit.getFileDetails(req.params.fileId);
    const referenceIndex = await buildImageReferenceIndex();
    const usedIn = lookupImageUsages(referenceIndex, {
      url: file.url,
      filePath: file.filePath,
      name: file.name,
    });

    res.json({
      success: true,
      fileId: file.fileId,
      name: file.name,
      url: file.url,
      usedIn,
      isUsed: usedIn.length > 0,
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      success: false,
      message: "File not found or usage check failed",
    });
  }
};

const deleteMediaFile = async (req, res) => {
  try {
    const imagekit = requireImageKit(res);
    if (!imagekit) return;

    const fileId = req.params.fileId;
    const confirmed =
      req.query.confirm === "true" || req.body?.confirm === true;

    const file = await imagekit.getFileDetails(fileId);
    const referenceIndex = await buildImageReferenceIndex();
    const usedIn = lookupImageUsages(referenceIndex, {
      url: file.url,
      filePath: file.filePath,
      name: file.name,
    });

    if (usedIn.length > 0 && !confirmed) {
      return res.status(409).json({
        success: false,
        code: "IMAGE_IN_USE",
        message: `This image is currently used in ${usedIn.length} place(s). Deleting it will break those images on the live site.`,
        fileId: file.fileId,
        name: file.name,
        url: file.url,
        usedIn,
        requiresConfirmation: true,
      });
    }

    await imagekit.deleteFile(fileId);

    res.json({
      success: true,
      deleted: true,
      fileId,
      name: file.name,
      usedIn,
      wasInUse: usedIn.length > 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete file",
    });
  }
};

module.exports = {
  listMediaLibrary,
  getMediaUsage,
  getFileUsageCheck,
  deleteMediaFile,
};
