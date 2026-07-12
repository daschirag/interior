/* Vinayak Interiors — public API client (no build step) */
(function () {
  "use strict";

  var BASE = window.VINAYAK_API || "http://localhost:5000/api";

  function getJson(path) {
    return fetch(BASE + path).then(function (res) {
      if (!res.ok) throw new Error("GET " + path + " failed");
      return res.json();
    });
  }

  function postJson(path, body) {
    return fetch(BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      });
    });
  }

  function getVisitorId() {
    try {
      var id = localStorage.getItem("vinayak_visitor_id");
      if (!id) {
        id = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("vinayak_visitor_id", id);
      }
      return id;
    } catch (e) {
      return "anonymous";
    }
  }

  function currentPageName() {
    var path = window.location.pathname || "";
    var file = path.split("/").pop();
    return file || "index.html";
  }

  window.VINAYAK = {
    baseUrl: BASE,

    getLang: function () {
      try {
        var stored = localStorage.getItem("vinayak_lang");
        if (stored === "kn" || stored === "hi" || stored === "en") {
          return stored;
        }
      } catch (e) {}
      if (window.VINAYAK_I18N && VINAYAK_I18N.getLang) {
        return VINAYAK_I18N.getLang();
      }
      return "en";
    },

    withLang: function (path) {
      var lang = this.getLang();
      var sep = path.indexOf("?") >= 0 ? "&" : "?";
      return path + sep + "lang=" + encodeURIComponent(lang);
    },

    getProjects: function (featured) {
      var path = "/projects" + (featured ? "?featured=true" : "");
      return getJson(this.withLang(path));
    },

    getDisciplines: function () {
      return getJson(this.withLang("/disciplines"));
    },

    getDistricts: function () {
      return getJson("/districts");
    },

    getSiteSettings: function () {
      return getJson("/site-settings");
    },

    getStudios: function () {
      return getJson(this.withLang("/studios"));
    },

    getKarnatakaLocations: function () {
      return getJson("/locations/karnataka");
    },

    getContentBlocks: function (page) {
      var q = page ? "?page=" + encodeURIComponent(page) : "";
      return getJson(this.withLang("/content-blocks" + q));
    },

    getContentBlock: function (sectionKey) {
      return getJson(
        this.withLang("/content-blocks/" + encodeURIComponent(sectionKey)),
      );
    },

    postContact: function (body) {
      return postJson("/contact", body);
    },

    trackEvent: function (eventType, extra) {
      var payload = Object.assign(
        {
          eventType: eventType,
          page: currentPageName(),
          visitorId: getVisitorId(),
          referrer: document.referrer || "Direct",
          meta: {
            device: window.innerWidth <= 768 ? "Mobile" : "Desktop",
            browser: navigator.userAgent,
          },
        },
        extra || {}
      );
      return postJson("/events", payload).catch(function () {});
    },

    trackPageView: function (page) {
      return this.trackEvent("page_view", { page: page || currentPageName() });
    },

    getVisitorId: getVisitorId,
  };
})();
