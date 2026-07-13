/* Studio discipline media: cover + cover-flow lightbox on “View more photos” */
(function () {
  "use strict";

  var lightboxEl = null;
  var lastFocus = null;
  var delegated = false;
  var lightboxGallery = null;

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.getElementById("svcLightbox");
    if (!lightboxEl) {
      lightboxEl = document.createElement("div");
      lightboxEl.id = "svcLightbox";
      lightboxEl.className = "svc-lightbox";
      lightboxEl.hidden = true;
      lightboxEl.innerHTML =
        '<div class="svc-lightbox-backdrop" data-close="1"></div>' +
        '<div class="svc-lightbox-panel" role="dialog" aria-modal="true" aria-label="Discipline photos">' +
        '<button type="button" class="svc-lightbox-close" aria-label="Close">&times;</button>' +
        '<p class="svc-lightbox-title cap"></p>' +
        '<div class="svc-lightbox-flow" data-svc-gallery data-active="0">' +
        '<div class="svc-gallery-stage"></div>' +
        '<button type="button" class="svc-gallery-nav prev" aria-label="Previous photo">&#8249;</button>' +
        '<button type="button" class="svc-gallery-nav next" aria-label="Next photo">&#8250;</button>' +
        '<div class="svc-gallery-bar">' +
        '<span class="svc-gallery-count">1 / 1</span>' +
        "</div>" +
        "</div>" +
        "</div>";
      document.body.appendChild(lightboxEl);
    }
    lightboxEl.addEventListener("click", function (e) {
      if (
        e.target.getAttribute("data-close") === "1" ||
        e.target.closest(".svc-lightbox-close")
      ) {
        closeLightbox();
      }
    });
    lightboxGallery = lightboxEl.querySelector("[data-svc-gallery]");
    return lightboxEl;
  }

  function closeLightbox() {
    var box = ensureLightbox();
    box.hidden = true;
    document.body.classList.remove("svc-lightbox-open");
    document.removeEventListener("keydown", onLightboxKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onLightboxKey(e) {
    if (e.key === "Escape") {
      closeLightbox();
      return;
    }
    if (!lightboxGallery || lightboxEl.hidden) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      var i = parseInt(lightboxGallery.getAttribute("data-active") || "0", 10) - 1;
      setActive(lightboxGallery, i);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      var j = parseInt(lightboxGallery.getAttribute("data-active") || "0", 10) + 1;
      setActive(lightboxGallery, j);
    }
  }

  function buildSlidesHtml(urls) {
    return (urls || [])
      .map(function (u, i) {
        var preset = i === 0 ? "hero" : "card";
        var src = u;
        if (window.VinayakImageUrl && window.VinayakImageUrl.optimizeImageUrl) {
          src = window.VinayakImageUrl.optimizeImageUrl(u, preset);
        }
        return (
          '<div class="svc-gallery-slide" data-index="' +
          i +
          '"><div class="ph ticks" data-lazy-bg="' +
          String(src).replace(/"/g, "&quot;") +
          '" data-lazy-src="' +
          String(u).replace(/"/g, "&quot;") +
          '" data-ik-preset="' +
          preset +
          '" style="position:absolute;inset:0;background-size:cover;background-position:center;"></div></div>'
        );
      })
      .join("");
  }

  function applySlidePreset(slide, preset) {
    var el = slide.querySelector("[data-lazy-bg], .ph");
    if (!el) return;
    var raw = el.getAttribute("data-lazy-src") || el.getAttribute("data-lazy-bg");
    if (!raw) return;
    if (!el.getAttribute("data-lazy-src")) el.setAttribute("data-lazy-src", raw);
    var src = raw;
    if (window.VinayakImageUrl && window.VinayakImageUrl.optimizeImageUrl) {
      var base = el.getAttribute("data-lazy-src") || raw;
      if (window.VinayakImageUrl.stripExistingTr) {
        base = window.VinayakImageUrl.stripExistingTr(base);
      }
      src = window.VinayakImageUrl.optimizeImageUrl(base, preset);
    }
    el.setAttribute("data-lazy-bg", src);
    el.setAttribute("data-ik-preset", preset);
    el.style.backgroundImage = 'url("' + src.replace(/"/g, '\\"') + '")';
  }

  function setActive(gallery, index) {
    var slides = Array.prototype.slice.call(
      gallery.querySelectorAll(".svc-gallery-slide")
    );
    if (!slides.length) return;
    var n = slides.length;
    index = ((index % n) + n) % n;
    gallery.setAttribute("data-active", String(index));
    var left = (index - 1 + n) % n;
    var right = (index + 1) % n;
    slides.forEach(function (slide, i) {
      slide.classList.remove("is-center", "is-left", "is-right", "is-hidden");
      if (i === index) {
        slide.classList.add("is-center");
        applySlidePreset(slide, "hero");
      } else if (n === 2 && i === right) {
        slide.classList.add("is-right");
        applySlidePreset(slide, "card");
      } else if (n > 2 && i === left) {
        slide.classList.add("is-left");
        applySlidePreset(slide, "card");
      } else if (n > 2 && i === right) {
        slide.classList.add("is-right");
        applySlidePreset(slide, "card");
      } else {
        slide.classList.add("is-hidden");
      }
    });
    var label = gallery.querySelector(".svc-gallery-count");
    if (label) label.textContent = index + 1 + " / " + n;
  }

  function openLightbox(urls, title, startIndex) {
    var list = (urls || []).filter(Boolean);
    if (!list.length) return;
    var box = ensureLightbox();
    var titleEl = box.querySelector(".svc-lightbox-title");
    var stage = box.querySelector(".svc-gallery-stage");
    titleEl.textContent = title || "Photos";
    lightboxGallery.setAttribute("data-images", JSON.stringify(list));
    if (list.length <= 1) lightboxGallery.classList.add("is-single");
    else lightboxGallery.classList.remove("is-single");
    stage.innerHTML = buildSlidesHtml(list);
    setActive(lightboxGallery, startIndex || 0);
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add("svc-lightbox-open");
    document.addEventListener("keydown", onLightboxKey);
    var closeBtn = box.querySelector(".svc-lightbox-close");
    if (closeBtn) closeBtn.focus();
  }

  function getUrls(trigger) {
    var host = trigger.closest("[data-svc-gallery], [data-images]");
    var raw =
      (host && host.getAttribute("data-images")) ||
      (trigger.getAttribute && trigger.getAttribute("data-images"));
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (e) {}
    }
    return [];
  }

  function ensureDelegation() {
    if (delegated) return;
    delegated = true;
    document.addEventListener("click", function (e) {
      var more = e.target.closest(".svc-gallery-more");
      if (more) {
        e.preventDefault();
        e.stopPropagation();
        var urls = getUrls(more);
        var item = more.closest("[data-cms-discipline], .svc-item");
        var title =
          (item && item.getAttribute("data-cms-edit-label")) ||
          (item &&
            item.querySelector(".svc-name") &&
            item.querySelector(".svc-name").textContent) ||
          "Photos";
        openLightbox(urls, String(title).trim(), 0);
        return;
      }

      var prev = e.target.closest(".svc-lightbox .svc-gallery-nav.prev");
      var next = e.target.closest(".svc-lightbox .svc-gallery-nav.next");
      if (!prev && !next) return;
      var gallery = e.target.closest("[data-svc-gallery]");
      if (!gallery) return;
      e.preventDefault();
      e.stopPropagation();
      var i = parseInt(gallery.getAttribute("data-active") || "0", 10);
      setActive(gallery, prev ? i - 1 : i + 1);
    });
  }

  function wireAll() {
    ensureDelegation();
  }

  window.VINAYAK_SVC_GALLERY = {
    wireAll: wireAll,
    openLightbox: openLightbox,
    closeLightbox: closeLightbox,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireAll);
  } else {
    wireAll();
  }
})();
