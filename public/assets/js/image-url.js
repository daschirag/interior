/* ImageKit transform helpers + preset detection for local/CMS image URLs */
(function (global) {
  "use strict";

  var PRESETS = {
    hero: "w-1920,q-75,f-auto",
    card: "w-600,q-75,f-auto",
    mobile: "w-900,q-75,f-auto",
    thumb: "w-400,q-70,f-auto",
  };

  function isImageKit(url) {
    return /imagekit\.io/i.test(String(url || ""));
  }

  function stripExistingTr(url) {
    var u = String(url || "");
    u = u.replace(/([?&])tr=[^&]*/g, function (_, sep) {
      return sep === "?" ? "?" : "";
    });
    u = u.replace(/\?&/, "?").replace(/[?&]$/, "");
    u = u.replace(/\/tr:[^/]+\//, "/");
    return u;
  }

  function applyImageKitTransform(url, transform) {
    if (!url || !transform) return url;
    var u = stripExistingTr(url);
    if (/ik\.imagekit\.io/i.test(u) && !/\/tr:[^/]+\//.test(u)) {
      // Prefer path-based transforms: …/tr:w-600…/path.jpg
      u = u.replace(
        /(https?:\/\/ik\.imagekit\.io\/[^/]+)\//i,
        "$1/tr:" + transform + "/"
      );
      if (/\/tr:/.test(u)) return u;
    }
    var sep = u.indexOf("?") >= 0 ? "&" : "?";
    return u + sep + "tr=" + transform;
  }

  function inferPreset(url, explicit) {
    if (explicit && PRESETS[explicit]) return explicit;
    var u = String(url || "").toLowerCase();
    if (/mobile|hero|studio|room-|proc-|ba-|contact|panel-/.test(u)) {
      if (/mobile/.test(u)) return "mobile";
      if (/featured|svc-|living\.jpg|kitchen\.jpg/.test(u)) return "card";
      return "hero";
    }
    if (/featured|svc-|proj-|thumb/.test(u)) return "card";
    return "card";
  }

  function optimizeImageUrl(url, preset) {
    if (!url || typeof url !== "string") return url;
    if (/^(data:|blob:)/i.test(url)) return url;
    var key = inferPreset(url, preset);
    var transform = PRESETS[key] || PRESETS.card;
    if (isImageKit(url)) return applyImageKitTransform(url, transform);
    // Local /assets URLs are pre-compressed on disk to the same width/quality budgets.
    return url;
  }

  global.VinayakImageUrl = {
    PRESETS: PRESETS,
    isImageKit: isImageKit,
    applyImageKitTransform: applyImageKitTransform,
    inferPreset: inferPreset,
    optimizeImageUrl: optimizeImageUrl,
  };
})(typeof window !== "undefined" ? window : globalThis);
