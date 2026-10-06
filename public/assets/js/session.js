/* Aurum Atelier — site navigation (no login gate) */
(function () {
  "use strict";
  var AURUM = (window.AURUM = window.AURUM || {});
  var HOME = "dashboard.html";
  var ENTRANCE = "index.html";

  AURUM.auth = {
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
    }
  };
})();
