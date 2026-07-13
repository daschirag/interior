/**
 * Normalize discipline gallery: images[] + image_url cover (images[0]).
 */
function normalizeDisciplineImages(discipline) {
  if (!discipline || typeof discipline !== "object") {
    return { images: [], image_url: null };
  }

  var images = Array.isArray(discipline.images)
    ? discipline.images.filter(function (u) {
        return u != null && String(u).trim() !== "";
      })
    : [];

  if (!images.length && discipline.image_url) {
    images = [discipline.image_url];
  }

  var image_url = images[0] || discipline.image_url || null;
  return { images: images, image_url: image_url };
}

module.exports = { normalizeDisciplineImages };
