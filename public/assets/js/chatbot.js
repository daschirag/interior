/* Vinayak chat widget — local engine + optional API for leads */
(function () {
  "use strict";

  function tt(key, fallback) {
    if (window.VINAYAK_I18N && typeof window.VINAYAK_I18N.t === "function") {
      var v = window.VINAYAK_I18N.t(key);
      if (v && v !== key) return v;
    }
    return fallback || key;
  }

  var STORAGE_KEY = "vx_chat_v1";
  var GREETING_FALLBACK = "Hi! Ask me about our services, pricing, or process.";
  var TYPING_MIN_MS = 450;
  var TYPING_MAX_MS = 600;

  var CHAT_ICON =
    '<svg class="vx-icon-chat" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7z" opacity=".85"/></svg>';
  var CLOSE_ICON =
    '<svg class="vx-icon-close" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>';
  var SEND_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var PANEL_CLOSE_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>';

  function pageFile() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    return (path.split("/").pop() || "").toLowerCase();
  }

  function isEntrancePage() {
    var file = pageFile();
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    return (
      file === "index.html" ||
      file === "" ||
      path === "/" ||
      /\/$/.test(path)
    );
  }

  function isDashboardPage() {
    var file = pageFile();
    var fromBody =
      document.body && document.body.getAttribute("data-cms-page");
    return (
      file === "dashboard.html" ||
      (fromBody && String(fromBody).toLowerCase() === "dashboard")
    );
  }

  function isLocalHost() {
    var h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1";
  }

  function apiBase() {
    if (isLocalHost()) return "http://localhost:5000/api";
    var base = window.VINAYAK_API || "/api";
    return String(base).replace(/\/$/, "");
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function uid() {
    return (
      "vx_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function bindDashboardHeroVisibility(root) {
    var hero = document.querySelector("section.hero");
    if (!hero) {
      root.classList.add("is-ready");
      return;
    }

    root.classList.add("is-deferred");
    root.setAttribute("aria-hidden", "true");

    function setVisible(show) {
      root.classList.toggle("is-ready", show);
      root.setAttribute("aria-hidden", show ? "false" : "true");
      if (!show && root.classList.contains("is-open")) {
        root.classList.remove("is-open");
        var fab = root.querySelector(".vx-chat-fab");
        if (fab) {
          fab.setAttribute("aria-expanded", "false");
          fab.setAttribute("aria-label", "Open chat assistant");
        }
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      var onScroll = function () {
        setVisible(window.scrollY > hero.offsetHeight * 0.55);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        var entry = entries[0];
        if (!entry) return;
        setVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px -12% 0px",
      },
    );
    observer.observe(hero);
  }

  function bindVisualViewport(root) {
    var vv = window.visualViewport;
    if (!vv) return;

    function sync() {
      var h = Math.round(vv.height);
      root.style.setProperty("--vx-vvh", h + "px");
      if (root.classList.contains("is-open")) {
        var offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        root.style.bottom = Math.max(12, offset + 8) + "px";
      } else {
        root.style.bottom = "";
      }
    }

    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    sync();
  }

  function buildMarkup() {
    return (
      '<div class="vx-chat" data-vx-chat>' +
      '<div class="vx-chat-panel" id="vx-chat-panel" role="dialog" aria-modal="true" aria-label="Vinayak Interiors chat assistant">' +
      '<div class="vx-chat-handle" aria-hidden="true"><span></span></div>' +
      '<div class="vx-chat-head">' +
      '<div class="vx-chat-head-copy">' +
      '<p class="vx-chat-kicker" data-vx-i18n="chat.kicker">Studio assistant</p>' +
      '<p class="vx-chat-title" data-vx-i18n="chat.title">Ask Vinayak</p>' +
      "</div>" +
      '<div class="vx-chat-head-right">' +
      '<div class="vx-chat-status-wrap">' +
      '<span class="vx-chat-status" data-vx-i18n="chat.status">Online</span>' +
      '<span class="vx-chat-status-hint" data-vx-i18n="chat.status_hint">Usually replies instantly</span>' +
      "</div>" +
      '<button type="button" class="vx-chat-close" data-vx-close data-vx-i18n-attr="aria-label:chat.close" aria-label="Close chat">' +
      PANEL_CLOSE_ICON +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="vx-chat-log" data-vx-log aria-live="polite"></div>' +
      '<form class="vx-chat-compose" data-vx-form>' +
      '<textarea rows="1" data-vx-input data-vx-i18n-attr="placeholder:chat.placeholder|aria-label:chat.msg_aria" placeholder="Ask about services, pricing…" aria-label="Your message"></textarea>' +
      '<button type="submit" class="vx-chat-send" data-vx-send data-vx-i18n-attr="aria-label:chat.send" aria-label="Send message" disabled>' +
      SEND_ICON +
      "</button>" +
      "</form>" +
      "</div>" +
      '<button type="button" class="vx-chat-fab" aria-expanded="false" aria-controls="vx-chat-panel" data-vx-i18n-attr="aria-label:chat.open" aria-label="Open chat assistant">' +
      CHAT_ICON +
      CLOSE_ICON +
      "</button>" +
      "</div>"
    );
  }

  function applyChatI18n(root) {
    if (!root) return;
    root.querySelectorAll("[data-vx-i18n]").forEach(function (el) {
      el.textContent = tt(el.getAttribute("data-vx-i18n"), el.textContent);
    });
    root.querySelectorAll("[data-vx-i18n-attr]").forEach(function (el) {
      String(el.getAttribute("data-vx-i18n-attr") || "")
        .split("|")
        .forEach(function (pair) {
          var parts = pair.split(":");
          if (parts.length < 2) return;
          el.setAttribute(parts[0], tt(parts[1], el.getAttribute(parts[0]) || ""));
        });
    });
  }

  /**
   * Prefer local rule engine (always available). Sync to API when reachable
   * so leads still land in chatbot_leads once the backend is deployed/running.
   */
  async function resolveReply(message, sessionId, sessionHint) {
    var localEngine = window.VinayakChatEngine;
    var localResult =
      localEngine && typeof localEngine.processMessage === "function"
        ? localEngine.processMessage(message, sessionHint || {})
        : null;

    try {
      var controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = controller
        ? setTimeout(function () {
            controller.abort();
          }, 3500)
        : null;

      var res = await fetch(apiBase() + "/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, sessionId: sessionId }),
        signal: controller ? controller.signal : undefined,
      });
      if (timer) clearTimeout(timer);
      var data = await res.json();
      if (res.ok && data && data.success && data.reply) {
        return {
          reply: data.reply,
          intent: data.intent,
          needsContact: !!data.needsContact,
          session: localResult ? localResult.session : null,
        };
      }
    } catch (e) {
      /* fall through to local */
    }

    if (localResult) {
      return {
        reply: localResult.reply,
        intent: localResult.intent,
        needsContact: !!localResult.needsContact,
        session: localResult.session,
      };
    }

    throw new Error("Chat engine unavailable");
  }

  function init() {
    if (isEntrancePage()) return;
    if (document.querySelector("[data-vx-chat]")) return;

    var wrap = document.createElement("div");
    wrap.innerHTML = buildMarkup();
    var root = wrap.firstElementChild;
    document.body.appendChild(root);
    applyChatI18n(root);
    window.addEventListener("vinayak:langchange", function () {
      applyChatI18n(root);
    });

    var fab = root.querySelector(".vx-chat-fab");
    var closeBtn = root.querySelector("[data-vx-close]");
    var log = root.querySelector("[data-vx-log]");
    var form = root.querySelector("[data-vx-form]");
    var input = root.querySelector("[data-vx-input]");
    var sendBtn = root.querySelector("[data-vx-send]");

    var busy = false;
    var engineSession = { awaitingContact: false, originalQuestion: null };
    var state = loadState() || {
      sessionId: uid(),
      messages: [],
      awaitingContact: false,
    };
    if (!state.sessionId) state.sessionId = uid();
    if (!Array.isArray(state.messages)) state.messages = [];
    engineSession.awaitingContact = !!state.awaitingContact;

    function persist() {
      saveState({
        sessionId: state.sessionId,
        messages: state.messages,
        awaitingContact: !!state.awaitingContact,
      });
    }

    function scrollLog() {
      requestAnimationFrame(function () {
        log.scrollTop = log.scrollHeight;
      });
    }

    function syncSendEnabled() {
      var empty = !String(input.value || "").trim();
      sendBtn.disabled = busy || empty;
    }

    function setBusy(next) {
      busy = !!next;
      input.disabled = busy;
      syncSendEnabled();
    }

    function appendBubble(role, text) {
      var el = document.createElement("div");
      el.className =
        "vx-bubble " + (role === "user" ? "vx-bubble--user" : "vx-bubble--bot");
      el.textContent = text;
      log.appendChild(el);
      scrollLog();
      return el;
    }

    function showTyping() {
      var el = document.createElement("div");
      el.className = "vx-typing";
      el.setAttribute("data-vx-typing", "1");
      el.setAttribute("aria-label", tt("chat.typing", "Assistant is typing"));
      el.innerHTML = "<i></i><i></i><i></i>";
      log.appendChild(el);
      scrollLog();
      return el;
    }

    function clearLeadForms() {
      log.querySelectorAll("[data-vx-lead]").forEach(function (n) {
        n.remove();
      });
    }

    function showLeadForm() {
      clearLeadForms();
      var box = document.createElement("div");
      box.className = "vx-lead";
      box.setAttribute("data-vx-lead", "1");
      box.innerHTML =
        '<span class="vx-lead-label">' +
        tt("chat.lead_label", "Share your details") +
        "</span>" +
        '<input type="text" data-vx-lead-name placeholder="' +
        tt("chat.lead_name", "Your name") +
        '" autocomplete="name" aria-label="' +
        tt("chat.lead_name", "Your name") +
        '" />' +
        '<input type="tel" data-vx-lead-phone placeholder="' +
        tt("chat.lead_phone", "Phone number") +
        '" autocomplete="tel" aria-label="' +
        tt("chat.lead_phone", "Phone number") +
        '" />' +
        '<div class="vx-lead-actions">' +
        '<button type="button" class="vx-lead-btn" data-vx-lead-submit>' +
        tt("chat.lead_submit", "Send to studio") +
        "</button>" +
        '<button type="button" class="vx-lead-btn vx-lead-skip" data-vx-lead-skip>' +
        tt("chat.lead_skip", "Skip") +
        "</button>" +
        "</div>";
      log.appendChild(box);
      scrollLog();

      box
        .querySelector("[data-vx-lead-submit]")
        .addEventListener("click", function () {
          var name = (box.querySelector("[data-vx-lead-name]").value || "").trim();
          var phone = (
            box.querySelector("[data-vx-lead-phone]").value || ""
          ).trim();
          if (!name || !phone) {
            box.querySelector("[data-vx-lead-phone]").focus();
            return;
          }
          clearLeadForms();
          sendMessage(name + ", " + phone);
        });
      box
        .querySelector("[data-vx-lead-skip]")
        .addEventListener("click", function () {
          clearLeadForms();
          state.awaitingContact = false;
          engineSession.awaitingContact = false;
          engineSession.originalQuestion = null;
          persist();
          var note = tt(
            "chat.lead_skip_note",
            "No problem — you can reach us anytime via Contact or ask another question here.",
          );
          appendBubble("bot", note);
          state.messages.push({ role: "bot", text: note });
          persist();
        });
    }

    function renderHistory() {
      log.innerHTML = "";
      if (!state.messages.length) {
        var greeting = tt("chat.greeting", GREETING_FALLBACK);
        appendBubble("bot", greeting);
        state.messages.push({ role: "bot", text: greeting });
        persist();
      } else {
        state.messages.forEach(function (m) {
          appendBubble(m.role === "user" ? "user" : "bot", m.text);
        });
      }
      if (state.awaitingContact) showLeadForm();
      scrollLog();
    }

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      fab.setAttribute(
        "aria-label",
        open
          ? tt("chat.close", "Close chat assistant")
          : tt("chat.open", "Open chat assistant"),
      );
      if (open) {
        renderHistory();
        setTimeout(function () {
          input.focus();
          syncSendEnabled();
        }, 260);
      } else {
        root.style.bottom = "";
      }
    }

    fab.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!root.classList.contains("is-open"));
    });

    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      fab.focus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("is-open")) {
        setOpen(false);
        fab.focus();
      }
    });

    input.addEventListener("input", syncSendEnabled);

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) form.requestSubmit();
      }
    });

    async function sendMessage(text) {
      var msg = String(text || "").trim();
      if (!msg || busy) return;

      appendBubble("user", msg);
      state.messages.push({ role: "user", text: msg });
      persist();
      input.value = "";
      setBusy(true);

      var typing = showTyping();
      var delay =
        TYPING_MIN_MS +
        Math.floor(Math.random() * (TYPING_MAX_MS - TYPING_MIN_MS));

      try {
        var result = await Promise.all([
          resolveReply(msg, state.sessionId, engineSession),
          sleep(delay),
        ]).then(function (pair) {
          return pair[0];
        });

        typing.remove();
        appendBubble("bot", result.reply);
        state.messages.push({ role: "bot", text: result.reply });
        state.awaitingContact = !!result.needsContact;
        if (result.session) {
          engineSession = result.session;
        } else {
          engineSession.awaitingContact = !!result.needsContact;
          if (result.needsContact) engineSession.originalQuestion = msg;
        }
        persist();
        if (result.needsContact) showLeadForm();
        else clearLeadForms();
        scrollLog();
      } catch (err) {
        typing.remove();
        var fail =
          "I couldn't answer just now. Please try again, or visit Contact.html.";
        appendBubble("bot", fail);
        state.messages.push({ role: "bot", text: fail });
        persist();
      } finally {
        setBusy(false);
        if (root.classList.contains("is-open")) input.focus();
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage(input.value);
    });

    syncSendEnabled();
    bindVisualViewport(root);

    if (isDashboardPage()) {
      bindDashboardHeroVisibility(root);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
