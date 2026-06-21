/* Aurum Atelier — site navigation (no login gate) */
(function () {
  "use strict";
  var AURUM = (window.AURUM = window.AURUM || {});
  var HOME = "dashboard.html";
  var ENTRANCE = "index.html";

  AURUM.auth = {
    goEntrance: function () {
      try { sessionStorage.removeItem("aurum_seen"); } catch (e) {}
      window.location.href = ENTRANCE;
    },
    wireNav: function () {
      var page = document.body.getAttribute("data-page");
      if (!page) return;
      var homeHref = page === "home" ? "#main" : HOME;

      document.querySelectorAll('.nav-link[data-for="home"]').forEach(function (a) {
        a.setAttribute("href", homeHref);
      });
      document.querySelectorAll('.nav-brand[href="index.html"]').forEach(function (a) {
        a.setAttribute("href", homeHref);
      });
      document.querySelectorAll('.nav-cta[href="index.html"]').forEach(function (a) {
        a.setAttribute("href", ENTRANCE);
      });

      document.querySelectorAll(".nav-sheet a").forEach(function (a) {
        var nav = a.getAttribute("data-nav");
        if (nav === "home") a.setAttribute("href", homeHref);
        else if (nav === "projects") a.setAttribute("href", "Projects.html");
        else if (nav === "studio") a.setAttribute("href", "Services.html");
        else if (nav === "contact") a.setAttribute("href", "Contact.html");
        else if (nav === "entrance") a.setAttribute("href", ENTRANCE);
        else {
          var t = a.textContent.trim().toLowerCase();
          if (t === "home") a.setAttribute("href", homeHref);
          else if (t.indexOf("enter studio") !== -1) a.setAttribute("href", ENTRANCE);
        }
      });

      document.querySelectorAll('.foot-col a[href="index.html"]').forEach(function (a) {
        if (a.textContent.trim().toLowerCase().indexOf("home") !== -1) a.setAttribute("href", HOME);
      });

      var links = document.querySelector(".nav-links");
      if (links && !document.getElementById("navReplay")) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "nav-logout";
        btn.id = "navReplay";
        btn.textContent = "Replay entrance";
        btn.addEventListener("click", function () { AURUM.auth.goEntrance(); });
        links.appendChild(btn);
      }

      var sheet = document.querySelector(".nav-sheet");
      if (sheet && !document.getElementById("navReplaySheet")) {
        var lo = document.createElement("a");
        lo.href = "#";
        lo.id = "navReplaySheet";
        lo.textContent = "Replay entrance";
        lo.addEventListener("click", function (e) {
          e.preventDefault();
          document.body.classList.remove("nav-open");
          AURUM.auth.goEntrance();
        });
        sheet.appendChild(lo);
      }
    }
  };
})();
