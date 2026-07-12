/* Vinayak Interiors — client i18n (static UI strings) */
(function () {
  "use strict";

  var STORAGE_KEY = "vinayak_lang";
  var SUPPORTED = { en: true, kn: true, hi: true };
  var cache = {};
  var ready = null;

  function normalize(lang) {
    lang = String(lang || "en").toLowerCase();
    return SUPPORTED[lang] ? lang : "en";
  }

  function readStored() {
    try {
      return normalize(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return "en";
    }
  }

  // Sync from localStorage immediately so CMS ?lang= is correct before async init
  var currentLang = readStored();

  function writeStored(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function dictUrl(lang) {
    return "assets/js/i18n/" + lang + ".json";
  }

  function loadDict(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    return fetch(dictUrl(lang))
      .then(function (res) {
        if (!res.ok) throw new Error("i18n load failed: " + lang);
        return res.json();
      })
      .then(function (json) {
        cache[lang] = json || {};
        return cache[lang];
      })
      .catch(function () {
        cache[lang] = cache.en || {};
        return cache[lang];
      });
  }

  function t(key) {
    var dict = cache[currentLang] || {};
    var en = cache.en || {};
    if (dict[key] != null && String(dict[key]).trim() !== "") return dict[key];
    if (en[key] != null) return en[key];
    return key;
  }

  function applyStatic(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-i18n-key]").forEach(function (el) {
      if (el.closest("[data-i18n-skip]")) return;
      var key = el.getAttribute("data-i18n-key");
      if (!key) return;
      var attr = el.getAttribute("data-i18n-attr");
      var value = t(key);
      if (attr) {
        el.setAttribute(attr, value);
      } else if (el.getAttribute("data-i18n-html") === "true") {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    });

    document.documentElement.setAttribute("lang", currentLang === "en" ? "en" : currentLang);
    document.querySelectorAll("[data-lang-switch]").forEach(function (btn) {
      var lang = btn.getAttribute("data-lang-switch");
      btn.classList.toggle("is-active", lang === currentLang);
      btn.setAttribute("aria-pressed", lang === currentLang ? "true" : "false");
    });
  }

  function setLang(lang, opts) {
    lang = normalize(lang);
    var silent = opts && opts.silent;
    currentLang = lang;
    writeStored(lang);

    return loadDict("en")
      .then(function () {
        return loadDict(lang);
      })
      .then(function () {
        applyStatic();
        if (!silent) {
          window.dispatchEvent(
            new CustomEvent("vinayak:langchange", { detail: { lang: lang } }),
          );
        }
        return lang;
      });
  }

  function wireSwitcher(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-lang-switch]").forEach(function (btn) {
      if (btn.getAttribute("data-i18n-wired") === "1") return;
      btn.setAttribute("data-i18n-wired", "1");
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setLang(btn.getAttribute("data-lang-switch"));
      });
    });
  }

  function init() {
    if (ready) return ready;
    currentLang = readStored();
    ready = setLang(currentLang, { silent: true }).then(function () {
      wireSwitcher();
      return currentLang;
    });
    return ready;
  }

  window.VINAYAK_I18N = {
    init: init,
    setLang: setLang,
    getLang: function () {
      return currentLang;
    },
    t: t,
    apply: applyStatic,
    wireSwitcher: wireSwitcher,
    STORAGE_KEY: STORAGE_KEY,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
