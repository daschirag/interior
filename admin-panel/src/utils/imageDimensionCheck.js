/**
 * Parse recommended hint strings like "1920x1080, landscape".
 */
export function parseRecommendedHint(recommended) {
  if (!recommended) return null;

  const dimMatch = recommended.match(/(\d+)\s*x\s*(\d+)/i);
  const landscape = /\blandscape\b/i.test(recommended);
  const portrait = /\bportrait\b/i.test(recommended);
  const square = /\bsquare\b/i.test(recommended);

  return {
    width: dimMatch ? Number(dimMatch[1]) : null,
    height: dimMatch ? Number(dimMatch[2]) : null,
    landscape,
    portrait,
    square,
    raw: recommended,
  };
}

/**
 * Load image dimensions from a File using the browser Image API.
 */
export function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };

    img.src = url;
  });
}

/**
 * Soft warning when aspect/orientation differs from the slot recommendation.
 */
export function getDimensionWarning(dimensions, recommended) {
  const hint = parseRecommendedHint(recommended);
  if (!hint || !dimensions?.width || !dimensions?.height) return "";

  const ratio = dimensions.width / dimensions.height;
  const messages = [];

  if (hint.landscape && ratio < 0.95) {
    messages.push(
      "This image is portrait, but this section expects landscape (e.g. 16:9). You can still upload, but it may crop unexpectedly.",
    );
  } else if (hint.portrait && ratio > 1.05) {
    messages.push(
      "This image is landscape, but this section expects portrait. You can still upload, but it may crop unexpectedly.",
    );
  } else if (hint.square && (ratio < 0.9 || ratio > 1.1)) {
    messages.push(
      "This image is not square, but this section expects a square crop. You can still upload, but it may crop unexpectedly.",
    );
  }

  if (hint.width && hint.height) {
    const expectedRatio = hint.width / hint.height;
    const delta = Math.abs(ratio - expectedRatio) / expectedRatio;
    if (delta > 0.35 && messages.length === 0) {
      messages.push(
        `This image’s aspect ratio differs from the recommended ${hint.width}×${hint.height}. You can still upload, but it may crop unexpectedly.`,
      );
    }
  }

  return messages[0] || "";
}
