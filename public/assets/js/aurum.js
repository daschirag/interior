/* ============================================================
   AURUM ATELIER — Shared engine
   logo · cursor torch · nav · smooth scroll · reveals · magnetic
   Degrades gracefully: if libs/JS fail, content stays visible.
   ============================================================ */
(function () {
  "use strict";
  var AURUM = (window.AURUM = window.AURUM || {});
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;

  /* ---------- Logo SVG (reconstructed funnel / V mark) ---------- */
  AURUM.logoSVG = function () {
    return (
      '<svg class="aurum-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true">' +
        '<polygon class="lg-bar" points="8,15 56,15 52,22.5 12,22.5"/>' +
        '<polygon class="lg-bar" points="14.3,27 49.7,27 45.7,34.5 18.3,34.5"/>' +
        '<polygon class="lg-bar" points="20.6,39 43.4,39 39.4,46.5 24.6,46.5"/>' +
        '<path class="lg-v" d="M51 13 L32 60 L22.5 39" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>"
    );
  };
  function hydrateLogos() {
    var svg = AURUM.logoSVG();
    document.querySelectorAll("[data-logo]").forEach(function (el) {
      if (!el.dataset.logoDone) { el.innerHTML = svg; el.dataset.logoDone = "1"; }
    });
    // animate the loader mark drawing in
    document.querySelectorAll(".loader [data-logo] .aurum-mark").forEach(function (m) { m.classList.add("draw"); });
  }

  /* ---------- Custom cursor + torch ---------- */
  function initCursor() {
    if (coarse) return;
    var ring = document.querySelector(".cur-ring");
    var dot = document.querySelector(".cur-dot");
    var torch = document.querySelector(".torch");
    if (!ring || !dot) return;
    var rx = innerWidth / 2, ry = innerHeight / 2, mx = rx, my = ry;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (torch) torch.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      var t = e.target.closest("a,button,input,textarea,select,[data-cur],.magnetic,.room-tab,.mat,.style-opt,.proj-card");
      ring.classList.toggle("hover", !!t);
      var brass = e.target.closest("[data-cur-brass],.mat,.matcard,.btn.brass");
      ring.classList.toggle("brass", !!brass);
      var lab = t && t.getAttribute && t.getAttribute("data-cur");
      if (lab) { ring.setAttribute("data-cur", lab); ring.classList.add("label"); }
      else ring.classList.remove("label");
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      dot.style.left = rx + "px"; dot.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Site nav wiring (no login gate) ---------- */
  function initAuth() {
    if (AURUM.auth && AURUM.auth.wireNav) AURUM.auth.wireNav();
    return true;
  }

  /* ---------- Nav ---------- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var burger = document.querySelector(".nav-burger");
    if (burger) burger.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    document.querySelectorAll(".nav-sheet a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("nav-open"); });
    });
    // active link by data-page
    var page = document.body.getAttribute("data-page");
    if (page) document.querySelectorAll('.nav-link[data-for="' + page + '"]').forEach(function (l) { l.classList.add("active"); });
  }

  /* ---------- Progress bar ---------- */
  function initProgress() {
    var bar = document.querySelector(".progress");
    if (!bar) return;
    function upd() {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    upd(); window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
  }

  /* ---------- Reveal-on-scroll (own IO) ---------- */
  AURUM._revealIO = null;

  function createRevealObserver() {
    if (!("IntersectionObserver" in window)) return null;
    if (AURUM._revealIO) return AURUM._revealIO;
    AURUM._revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          AURUM._revealIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    return AURUM._revealIO;
  }

  AURUM.refreshReveals = function (root) {
    var scope = root && root.querySelectorAll ? root : document;
    var staggerRoots = root && root.querySelectorAll
      ? (root.matches && root.matches("[data-stagger]") ? [root] : scope.querySelectorAll("[data-stagger]"))
      : document.querySelectorAll("[data-stagger]");

    staggerRoots.forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.style.setProperty("--i", i);
        if (c.hasAttribute("data-reveal")) c.setAttribute("data-d", "1");
      });
    });

    var els = scope.querySelectorAll
      ? scope.querySelectorAll("[data-reveal]:not(.is-in)")
      : document.querySelectorAll("[data-reveal]:not(.is-in)");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      document.documentElement.classList.add("reveal-all");
      return;
    }

    var io = createRevealObserver();
    els.forEach(function (el) {
      io.observe(el);
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        el.classList.add("is-in");
        io.unobserve(el);
      }
    });
  };

  function initReveals() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    AURUM.refreshReveals();
  }

  /* ---------- Magnetic elements ---------- */
  function initMagnetic() {
    if (coarse || reduce) return;
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var s = parseFloat(el.getAttribute("data-mag")) || 0.32;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * s + "px," + y * s + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = "translate(0,0)"; });
    });
  }

  /* ---------- Smooth scroll (Lenis) + GSAP ScrollTrigger wiring ---------- */
  AURUM.lenis = null;
  function initSmooth() {
    if (reduce) return;
    var hasGsap = !!window.gsap;
    if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      try {
        var lenis = new Lenis({ duration: 0.95, lerp: 0.14, smoothWheel: true, wheelMultiplier: 1.05 });
        AURUM.lenis = lenis;
        if (hasGsap && window.ScrollTrigger) {
          lenis.on("scroll", ScrollTrigger.update);
          ScrollTrigger.scrollerProxy(document.documentElement, {
            scrollTop: function (value) {
              if (arguments.length) lenis.scrollTo(value, { immediate: true });
              return lenis.scroll;
            },
            getBoundingClientRect: function () {
              return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
            }
          });
          ScrollTrigger.addEventListener("refresh", function () { lenis.resize(); });
          gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
          gsap.ticker.lagSmoothing(0);
          ScrollTrigger.refresh();
        } else {
          requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
        }
      } catch (e) { /* fall back to native scroll */ }
    }
    // Page scroll animations — defer so hero LCP isn't blocked by GSAP transforms
    function setupScrollAnimations() {
      if (hasGsap && window.ScrollTrigger) {
        document.querySelectorAll("[data-parallax]").forEach(function (el) {
          if (el.closest(".hero")) return; // never parallax the LCP hero
          var amt = parseFloat(el.getAttribute("data-parallax")) || 0.18;
          gsap.fromTo(el, { yPercent: -amt * 50 }, {
            yPercent: amt * 50, ease: "none",
            scrollTrigger: { trigger: el.closest("[data-parallax-scope]") || el, start: "top bottom", end: "bottom top", scrub: true }
          });
        });
      }
      if (AURUM.onSmooth) try { AURUM.onSmooth(); } catch (e) {}
      if (hasGsap && window.ScrollTrigger) ScrollTrigger.refresh(true);
    }
    function whenIdle(fn) {
      if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 2500 });
      else setTimeout(fn, 1200);
    }
    if (window.VINAYAK_WAIT_CMS && window.VINAYAK_CMS_READY) {
      window.VINAYAK_CMS_READY.finally(function () { whenIdle(setupScrollAnimations); });
    } else {
      whenIdle(setupScrollAnimations);
    }
  }

  /* ---------- Lazy backgrounds & deferred video ---------- */
  function resolveAssetUrl(url, preset) {
    if (!url) return url;
    var resolved = /^(https?:|data:|\/)/.test(url) ? url : "/" + url.replace(/^\.\//, "");
    if (window.VinayakImageUrl && typeof window.VinayakImageUrl.optimizeImageUrl === "function") {
      return window.VinayakImageUrl.optimizeImageUrl(resolved, preset);
    }
    return resolved;
  }
  function loadLazyBg(el) {
    var preset = el.getAttribute("data-ik-preset") || undefined;
    var url = resolveAssetUrl(el.getAttribute("data-lazy-bg"), preset);
    if (!url || el.dataset.lazyDone) return;
    el.dataset.lazyDone = "1";
    el.style.backgroundImage = "url(" + url + ")";
    el.style.backgroundSize = el.getAttribute("data-lazy-size") || "cover";
    el.style.backgroundPosition = el.getAttribute("data-lazy-position") || "center";
    if (el.getAttribute("data-lazy-repeat")) el.style.backgroundRepeat = el.getAttribute("data-lazy-repeat");
    el.classList.add("lazy-bg--loaded");
  }
  function loadLazyVideo(el) {
    if (el.dataset.lazyDone) return;
    var src = resolveAssetUrl(el.getAttribute("data-lazy-video"));
    if (!src) return;
    el.dataset.lazyDone = "1";
    el.src = src;
    el.addEventListener("canplaythrough", function () { el.classList.add("loaded"); }, { once: true });
    el.load();
    el.play().catch(function () {});
    el.classList.add("lazy-video--loaded");
  }
  AURUM.refreshLazyMedia = function () {
    var lazyBgs = document.querySelectorAll("[data-lazy-bg]:not([data-lazy-eager]):not([data-lazy-done])");
    var lazyVideos = document.querySelectorAll("video[data-lazy-video]:not([data-lazy-done])");
    if (!lazyBgs.length && !lazyVideos.length) return;
    if (!("IntersectionObserver" in window)) {
      lazyBgs.forEach(loadLazyBg);
      lazyVideos.forEach(loadLazyVideo);
      return;
    }
    if (lazyBgs.length) {
      var bgIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { loadLazyBg(en.target); bgIo.unobserve(en.target); }
        });
      }, { rootMargin: "240px 0px", threshold: 0.01 });
      lazyBgs.forEach(function (el) { bgIo.observe(el); });
    }
    if (lazyVideos.length) {
      var vidIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { loadLazyVideo(en.target); vidIo.unobserve(en.target); }
        });
      }, { rootMargin: "320px 0px", threshold: 0.01 });
      lazyVideos.forEach(function (el) { vidIo.observe(el); });
    }
    lazyBgs.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 280 && rect.bottom > -280) loadLazyBg(el);
    });
  };

  function initLazyMedia() {
    var bgEls = document.querySelectorAll("[data-lazy-bg]");
    bgEls.forEach(function (el) {
      if (el.hasAttribute("data-lazy-eager")) loadLazyBg(el);
    });
    var lazyBgs = document.querySelectorAll("[data-lazy-bg]:not([data-lazy-eager])");
    var lazyVideos = document.querySelectorAll("video[data-lazy-video]");
    if (!("IntersectionObserver" in window)) {
      lazyBgs.forEach(loadLazyBg);
      lazyVideos.forEach(loadLazyVideo);
      return;
    }
    if (lazyBgs.length) {
      var bgIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { loadLazyBg(en.target); bgIo.unobserve(en.target); }
        });
      }, { rootMargin: "240px 0px", threshold: 0.01 });
      lazyBgs.forEach(function (el) { bgIo.observe(el); });
    }
    if (lazyVideos.length) {
      var vidIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { loadLazyVideo(en.target); vidIo.unobserve(en.target); }
        });
      }, { rootMargin: "320px 0px", threshold: 0.01 });
      lazyVideos.forEach(function (el) { vidIo.observe(el); });
    }
    window.addEventListener("load", function () {
      document.querySelectorAll("[data-lazy-bg]:not(.lazy-bg--loaded)").forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 280 && rect.bottom > -280) loadLazyBg(el);
      });
    });
  }

  /* ---------- Loader ---------- */
  function initLoader() {
    var loader = document.querySelector(".loader");
    if (!loader) return;
    var hide = function () {
      if (loader.dataset.hidden === "1") return;
      loader.dataset.hidden = "1";
      loader.classList.add("done");
      setTimeout(function () { loader.style.display = "none"; }, 500);
    };
    var seen = false;
    try { seen = sessionStorage.getItem("aurum_seen") === "1"; } catch (e) {}
    if (seen) {
      loader.style.display = "none";
      return;
    }
    try { sessionStorage.setItem("aurum_seen", "1"); } catch (e) {}
    // Don't wait for window.load (all images) — that crushed LCP. Paint ASAP.
    var start = function () { setTimeout(hide, 350); };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
      start();
    }
    setTimeout(hide, 1400); // safety
  }

  /* ---------- Boot ---------- */
  function boot() {
    try {
      initAuth();
      hydrateLogos();
      initLoader();
      initCursor();
      initNav();
      initProgress();
      initReveals();
      initMagnetic();
      initLazyMedia();
      initSmooth();
    } catch (e) {
      // ultimate fallback: show everything
      document.documentElement.classList.add("reveal-all");
      console.warn("AURUM engine fallback:", e);
    }
    // safety: if anything left hidden after 4s, reveal it
    setTimeout(function () {
      document.querySelectorAll("[data-reveal]:not(.is-in)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight) el.classList.add("is-in");
      });
    }, 4000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
