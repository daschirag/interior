/* Full-page Ask Vinayak (Chat.html) */
(function () {
  "use strict";

  var STORAGE_KEY = "vx_chat_page_v1";
  var GREETING =
    "Hello — I’m the Vinayak Interiors studio assistant.\n\n" +
    "I can explain our services, published budgets, studio locations, and our five-step process — using only what’s on this site.\n\n" +
    "Try a suggestion on the right, or ask in your own words. Useful pages: [Projects](Projects.html), [Studio](Services.html), [Contact](Contact.html).";

  var SEND_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>';

  function apiBase() {
    var h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return "http://localhost:5000/api";
    return String(window.VINAYAK_API || "/api").replace(/\/$/, "");
  }

  function uid() {
    return "vx_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function loadState() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Render markdown-style [label](href) as chips + keep text readable */
  function formatReplyHtml(text) {
    var links = [];
    var withPlaceholders = String(text || "").replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      function (_, label, href) {
        var safeHref = String(href || "").trim();
        if (!/^(https?:\/\/|mailto:|tel:|#|[A-Za-z0-9_.#\-]+\.html)/i.test(safeHref)) {
          return escapeHtml(label);
        }
        var i = links.length;
        links.push({ label: label, href: safeHref });
        return "\u0000L" + i + "\u0000";
      },
    );

    var html = escapeHtml(withPlaceholders).replace(/\n/g, "<br>");
    html = html.replace(/\u0000L(\d+)\u0000/g, function (_, idx) {
      var link = links[Number(idx)];
      if (!link) return "";
      return (
        '<a href="' +
        escapeHtml(link.href) +
        '">' +
        escapeHtml(link.label) +
        "</a>"
      );
    });

    if (links.length) {
      html += '<div class="ask-links">';
      links.forEach(function (link) {
        html +=
          '<a class="ask-link-chip" href="' +
          escapeHtml(link.href) +
          '">' +
          escapeHtml(link.label) +
          " →</a>";
      });
      html += "</div>";
    }
    return html;
  }

  async function resolveReply(message, sessionId, sessionHint) {
    var local =
      window.VinayakChatEngine &&
      window.VinayakChatEngine.processMessage(message, sessionHint || {});

    try {
      var controller = new AbortController();
      var t = setTimeout(function () {
        controller.abort();
      }, 3500);
      var res = await fetch(apiBase() + "/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, sessionId: sessionId }),
        signal: controller.signal,
      });
      clearTimeout(t);
      var data = await res.json();
      if (res.ok && data.success && data.reply) {
        return {
          reply: data.reply,
          intent: data.intent,
          needsContact: !!data.needsContact,
          session: local ? local.session : null,
        };
      }
    } catch (e) {}

    if (local) {
      return {
        reply: local.reply,
        intent: local.intent,
        needsContact: !!local.needsContact,
        session: local.session,
      };
    }
    throw new Error("unavailable");
  }

  function init() {
    var root = document.querySelector("[data-ask-page]");
    if (!root) return;

    var log = root.querySelector("[data-ask-log]");
    var form = root.querySelector("[data-ask-form]");
    var input = root.querySelector("[data-ask-input]");
    var sendBtn = root.querySelector("[data-ask-send]");
    var chips = root.querySelectorAll("[data-ask-chip]");

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

    function syncSend() {
      sendBtn.disabled = busy || !String(input.value || "").trim();
    }

    function setBusy(v) {
      busy = !!v;
      input.disabled = busy;
      syncSend();
    }

    function appendBubble(role, text) {
      var el = document.createElement("div");
      el.className =
        "ask-bubble " + (role === "user" ? "ask-bubble--user" : "ask-bubble--bot");
      if (role === "bot") el.innerHTML = formatReplyHtml(text);
      else el.textContent = text;
      log.appendChild(el);
      scrollLog();
      return el;
    }

    function showTyping() {
      var el = document.createElement("div");
      el.className = "ask-typing";
      el.innerHTML = "<i></i><i></i><i></i>";
      el.setAttribute("aria-label", "Assistant is typing");
      log.appendChild(el);
      scrollLog();
      return el;
    }

    function clearLead() {
      log.querySelectorAll("[data-ask-lead]").forEach(function (n) {
        n.remove();
      });
    }

    function showLead() {
      clearLead();
      var box = document.createElement("div");
      box.className = "ask-lead";
      box.setAttribute("data-ask-lead", "1");
      box.innerHTML =
        '<span class="ask-lead-label">Share your details</span>' +
        '<input type="text" data-ask-name placeholder="Your name" autocomplete="name" aria-label="Your name" />' +
        '<input type="tel" data-ask-phone placeholder="Phone number" autocomplete="tel" aria-label="Phone number" />' +
        '<div class="ask-lead-actions">' +
        '<button type="button" class="ask-lead-btn" data-ask-lead-go>Send to studio</button>' +
        '<button type="button" class="ask-lead-btn ask-lead-skip" data-ask-lead-skip>Skip</button>' +
        "</div>";
      log.appendChild(box);
      scrollLog();
      box.querySelector("[data-ask-lead-go]").addEventListener("click", function () {
        var name = (box.querySelector("[data-ask-name]").value || "").trim();
        var phone = (box.querySelector("[data-ask-phone]").value || "").trim();
        if (!name || !phone) {
          box.querySelector("[data-ask-phone]").focus();
          return;
        }
        clearLead();
        sendMessage(name + ", " + phone);
      });
      box.querySelector("[data-ask-lead-skip]").addEventListener("click", function () {
        clearLead();
        state.awaitingContact = false;
        engineSession.awaitingContact = false;
        persist();
        var note =
          "No problem — you can [open Contact](Contact.html) anytime, or ask another question here.";
        appendBubble("bot", note);
        state.messages.push({ role: "bot", text: note });
        persist();
      });
    }

    function renderHistory() {
      log.innerHTML = "";
      if (!state.messages.length) {
        appendBubble("bot", GREETING);
        state.messages.push({ role: "bot", text: GREETING });
        persist();
      } else {
        state.messages.forEach(function (m) {
          appendBubble(m.role === "user" ? "user" : "bot", m.text);
        });
      }
      if (state.awaitingContact) showLead();
      scrollLog();
    }

    async function sendMessage(text) {
      var msg = String(text || "").trim();
      if (!msg || busy) return;

      appendBubble("user", msg);
      state.messages.push({ role: "user", text: msg });
      persist();
      input.value = "";
      setBusy(true);
      var typing = showTyping();
      var delay = 450 + Math.floor(Math.random() * 150);

      try {
        var result = await Promise.all([
          resolveReply(msg, state.sessionId, engineSession),
          sleep(delay),
        ]).then(function (p) {
          return p[0];
        });
        typing.remove();
        appendBubble("bot", result.reply);
        state.messages.push({ role: "bot", text: result.reply });
        state.awaitingContact = !!result.needsContact;
        if (result.session) engineSession = result.session;
        else {
          engineSession.awaitingContact = !!result.needsContact;
          if (result.needsContact) engineSession.originalQuestion = msg;
        }
        persist();
        if (result.needsContact) showLead();
        else clearLead();
      } catch (e) {
        typing.remove();
        var fail =
          "I couldn’t answer just now. Please try again, or [visit Contact](Contact.html).";
        appendBubble("bot", fail);
        state.messages.push({ role: "bot", text: fail });
        persist();
      } finally {
        setBusy(false);
        input.focus();
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage(input.value);
    });
    input.addEventListener("input", syncSend);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) form.requestSubmit();
      }
    });
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var q = chip.getAttribute("data-ask-chip") || chip.textContent;
        sendMessage(q);
      });
    });

    sendBtn.innerHTML = SEND_ICON;
    syncSend();
    renderHistory();
    input.focus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
