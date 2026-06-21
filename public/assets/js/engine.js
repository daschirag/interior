/* ============================================================
   AURUM ATELIER — ENGINE
   Scroll choreography (camera dolly through the void),
   dust particles, cursor + torch, preload, scene labels.
   Degrades gracefully: no JS / reduced-motion → panel visible.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  function isMobileView() { return window.matchMedia("(max-width: 880px)").matches; }
  document.documentElement.classList.add("has-js");
  if (!coarse) document.documentElement.classList.add("has-cursor");

  var $ = function (s) { return document.querySelector(s); };
  var world = $("#world"), bloom = $("#bloom"), rays = $("#rays"), portal = $("#portal"), beam = $("#beam"),
      arch = $("#arch"), floor = $("#floor"), wallL = $("#wallL"), wallR = $("#wallR"),
      veil = $("#veil"), flash = $("#flash"), panel = $("#panel"), hero = $("#hero"), cue = $("#cue"),
      torch = $("#torchGlow"), cornerScene = $("#cornerScene");
  var whispers = Array.prototype.slice.call(document.querySelectorAll(".whisper"));
  var fogBack = $("#fogBack"), fogFront = $("#fogFront");

  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
  var onPreloadHidden = null;

  /* ---------- PRELOAD ---------- */
  (function preload() {
    var pl = $("#preload"), pct = $("#pct");
    var finished = false;
    function hide() {
      if (finished) return;
      finished = true;
      clearInterval(iv);
      if (!pl) {
        if (onPreloadHidden) onPreloadHidden();
        return;
      }
      pl.classList.add("done");
      setTimeout(function () {
        pl.style.display = "none";
        if (onPreloadHidden) onPreloadHidden();
      }, 850);
    }
    if (!pl) { hide(); return; }
    var n = 0;
    var iv = setInterval(function () {
      n += Math.random() * 16 + 6;
      if (n >= 100) { n = 100; clearInterval(iv); setTimeout(hide, 350); }
      if (pct) pct.textContent = (n < 10 ? "0" : "") + Math.floor(n);
    }, 130);
    setTimeout(hide, 3200); // safety
  })();

  /* ---------- CUSTOM CURSOR + TORCH ---------- */
  (function cursor() {
    if (coarse) return;
    var ring = $("#curRing"), dot = $("#curDot");
    var rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry, mx = rx, my = ry;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      var t = e.target.closest("a,button,input,.opt,.brand");
      if (ring) ring.classList.toggle("hover", !!t);
    });
    (function loop() {
      tx = lerp(tx, mx, 0.32); ty = lerp(ty, my, 0.32);
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      if (torch) torch.style.left = tx + "px", torch.style.top = ty + "px";
      if (ring) ring.style.left = rx + "px", ring.style.top = ry + "px";
      if (dot) dot.style.left = rx + "px", dot.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- DUST PARTICLES ---------- */
  (function dust() {
    var c = $("#dust"); if (!c || reduce) return;
    var ctx = c.getContext("2d"), parts = [], DPR = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      c.width = innerWidth * DPR; c.height = innerHeight * DPR;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);
    var N = Math.min(coarse ? 36 : 70, Math.floor(innerWidth / (coarse ? 22 : 18)));
    for (var i = 0; i < N; i++) parts.push({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      z: Math.random() * 1 + 0.3, r: Math.random() * 1.6 + 0.4,
      sx: (Math.random() - 0.5) * 0.18, sy: (Math.random() - 0.5) * 0.14, a: Math.random() * 0.3 + 0.06
    });
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.sx * p.z; p.y += p.sy * p.z;
        if (p.x < 0) p.x = innerWidth; if (p.x > innerWidth) p.x = 0;
        if (p.y < 0) p.y = innerHeight; if (p.y > innerHeight) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = "rgba(150,205,240," + p.a + ")";
        ctx.arc(p.x, p.y, p.r * p.z, 0, 6.28);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------- SCROLL CHOREOGRAPHY ---------- */
  var SCENES = ["SCENE 01 — DARKNESS", "SCENE 02 — APPROACH", "SCENE 03 — THE LONG WALK", "SCENE 04 — THRESHOLD", "SCENE 05 — ENTRY"];
  var prog = 0, target = 0;
  var mobileAutoPlay = false;

  function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - innerHeight); }
  function bump(p, center, halfA, halfB) {
    // 1 at center, ramps over halfA before, halfB after
    if (p < center) return clamp((p - (center - halfA)) / halfA, 0, 1);
    return clamp(1 - (p - center) / halfB, 0, 1);
  }

  function apply(p) {
    // camera dolly — dramatic push toward the portal
    var z = lerp(0, 920, ease(p));
    if (world) world.style.transform = "translateZ(" + z + "px)";

    // walls slide outward & recede
    var spread = ease(clamp(p * 1.1, 0, 1));
    if (wallL) wallL.style.transform = "rotateY(38deg) translateZ(-120px) translateX(" + (-spread * 34) + "vw)";
    if (wallR) wallR.style.transform = "rotateY(-38deg) translateZ(-120px) translateX(" + (spread * 34) + "vw)";

    // portal — the glowing door interior; brightens then dissolves into the flash
    if (portal) {
      var portalOp = clamp(1 - (p - 0.58) * 3.4, 0, 1);
      if (isMobileView()) portalOp *= 0.7;
      portal.style.opacity = String(portalOp);
    }
    if (bloom) {
      var bloomOp = 0.45 + ease(clamp(p * 1.2, 0, 1)) * 0.5;
      if (isMobileView()) bloomOp *= 0.7;
      bloom.style.opacity = String(bloomOp);
    }

    // god-rays: surface mid-journey, slow rotation, fade into the flash
    if (rays) {
      rays.style.opacity = String(clamp((p - 0.18) * 2.2, 0, 1) * clamp(1 - (p - 0.64) * 4, 0, 1) * 0.6);
      rays.style.transform = "translate(-50%,-50%) rotate(" + (p * 60) + "deg)";
    }

    // beam appears mid-journey
    if (beam) beam.style.opacity = String(clamp((p - 0.18) * 2, 0, 1) * clamp(1 - (p - 0.66) * 4, 0, 1));

    // floor fades in; brass arch stands from the first frame, then we pass through it
    if (floor) floor.style.opacity = String(clamp((p - 0.12) * 2, 0, 0.5));
    if (arch) arch.style.opacity = String(clamp(1 - (p - 0.46) * 3.6, 0, 1));

    // fog drifts, then clears as we enter the light
    if (fogBack) fogBack.style.opacity = String(lerp(1, 0.12, ease(clamp(p * 1.3, 0, 1))));
    if (fogFront) fogFront.style.opacity = String(lerp(0.9, 0, ease(clamp(p * 1.7, 0, 1))));

    // darkness veil lifts
    if (veil) veil.style.opacity = String(lerp(0.46, 0.08, ease(clamp(p * 1.5, 0, 1))));
    if (torch) torch.style.opacity = String(clamp(1 - p * 1.5, 0, 1));

    // hero text sits inside the doorway, then eases past as we step through
    if (hero) {
      var ho = clamp(1 - p / 0.30, 0, 1);
      hero.style.opacity = String(ho);
      hero.style.transform = "translate(-50%,-50%) scale(" + (1 + p * 2.0) + ")";
    }
    if (cue) cue.classList.toggle("hide", p > 0.04);

    // whisper words rise & fade as you pass through them
    var whisperWindow = isMobileView() ? 0.30 : 0.18;
    for (var i = 0; i < whispers.length; i++) {
      var w = whispers[i], at = parseFloat(w.getAttribute("data-at"));
      var o = clamp(1 - Math.abs(p - at) / whisperWindow, 0, 1);
      w.style.opacity = String(o);
      w.style.transform = "translateY(" + ((p - at) * -100) + "px) scale(" + lerp(0.97, 1.02, o) + ")";
      w.style.filter = "blur(" + lerp(6, 0, o) + "px)";
    }

    // "into the light" flash — peaks at the threshold
    if (flash) flash.style.opacity = String(bump(p, 0.74, 0.10, 0.12) * 0.7);

    // glass panel materializes out of the light
    var pe = ease(clamp((p - 0.80) / 0.17, 0, 1));
    if (panel) {
      panel.style.opacity = String(pe);
      panel.style.transform = "translateY(" + lerp(38, 0, pe) + "px) scale(" + lerp(0.93, 1, pe) + ")";
      panel.style.filter = "blur(" + lerp(16, 0, pe) + "px)";
    }

    // cross into the main site at journey's end (scroll on desktop; mobile uses mobileAnim completion)
    if (p > 0.93 && !entered && !mobileAutoPlay) goToSite();
  }

  var entered = false;
  var mobileStarted = false;
  function goToSite() {
    if (entered) return;
    entered = true;
    document.body.style.transition = "opacity 0.65s ease";
    document.body.style.opacity = "0";
    setTimeout(function () { window.location.href = "dashboard.html"; }, 650);
  }

  function startMobileEntrance() {
    if (mobileStarted) return;
    mobileStarted = true;
    mobileAutoPlay = true;
    var mobileDur = 9000, mobileStart = null;
    function mobileAnim(now) {
      if (mobileStart === null) mobileStart = now;
      var t = clamp((now - mobileStart) / mobileDur, 0, 1);
      apply(t);
      if (t < 1) requestAnimationFrame(mobileAnim);
      else {
        apply(1);
        setTimeout(goToSite, 300);
      }
    }
    apply(0);
    requestAnimationFrame(mobileAnim);
  }

  if (isMobileView()) {
    apply(0);
    onPreloadHidden = startMobileEntrance;
  } else if (reduce) {
    apply(1);
    document.documentElement.classList.remove("has-js");
    if (panel) { panel.style.opacity = "1"; panel.style.transform = "none"; panel.style.filter = "none"; }
  } else {
    window.addEventListener("scroll", function () { target = clamp(window.scrollY / maxScroll(), 0, 1); }, { passive: true });
    (function raf() {
      // weighted, inertial follow — slow & cinematic
      prog = lerp(prog, target, 0.07);
      if (Math.abs(prog - target) < 0.0002) prog = target;
      apply(prog);
      requestAnimationFrame(raf);
    })();
    apply(0);
  }

  /* brand → reset scroll to top (back to the darkness) */
  var brand = $("#brandHome");
  if (brand) brand.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  var enterBtn = $("#enterSite");
  if (enterBtn) enterBtn.addEventListener("click", function (e) {
    e.preventDefault();
    goToSite();
  });
})();
