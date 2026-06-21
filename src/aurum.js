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
      var brass = e.target.closest("[data-cur-brass],.mat,.btn.brass");
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
  function initReveals() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    // stagger indices
    document.querySelectorAll("[data-stagger]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.style.setProperty("--i", i);
        if (c.hasAttribute("data-reveal")) c.setAttribute("data-d", "1");
      });
    });
    if (!("IntersectionObserver" in window)) { document.documentElement.classList.add("reveal-all"); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
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
        var lenis = new Lenis({ duration: 1.1, lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9 });
        AURUM.lenis = lenis;
        if (hasGsap && window.ScrollTrigger) {
          lenis.on("scroll", ScrollTrigger.update);
          gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
          gsap.ticker.lagSmoothing(0);
        } else {
          requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
        }
      } catch (e) { /* fall back to native scroll */ }
    }
    // generic parallax via ScrollTrigger
    if (hasGsap && window.ScrollTrigger) {
      document.querySelectorAll("[data-parallax]").forEach(function (el) {
        var amt = parseFloat(el.getAttribute("data-parallax")) || 0.18;
        gsap.fromTo(el, { yPercent: -amt * 50 }, {
          yPercent: amt * 50, ease: "none",
          scrollTrigger: { trigger: el.closest("[data-parallax-scope]") || el, start: "top bottom", end: "bottom top", scrub: true }
        });
      });
    }
    if (AURUM.onSmooth) try { AURUM.onSmooth(); } catch (e) {}
  }

  /* ---------- Loader ---------- */
  function initLoader() {
    var loader = document.querySelector(".loader");
    if (!loader) return;
    var hide = function () {
      loader.classList.add("done");
      setTimeout(function () { loader.style.display = "none"; }, 850);
    };
    var seen = false;
    try { seen = sessionStorage.getItem("aurum_seen") === "1"; } catch (e) {}
    if (seen) { loader.style.display = "none"; }
    else {
      window.addEventListener("load", function () { setTimeout(hide, 1500); });
      setTimeout(hide, 3200); // safety
      try { sessionStorage.setItem("aurum_seen", "1"); } catch (e) {}
    }
  }

  /* ---------- Boot ---------- */
  function boot() {
    try {
      hydrateLogos();
      initLoader();
      initCursor();
      initNav();
      initProgress();
      initReveals();
      initMagnetic();
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
