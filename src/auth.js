/* ============================================================
   AURUM ATELIER — Auth (rendered into the glass panel)
   Login · Forgot · multi-step "Begin Your Design Journey"
   Vanilla JS. Success → enters the website (index.html).
   ============================================================ */
(function () {
  "use strict";
  var root = document.getElementById("pbody");
  if (!root) return;

  var SITE = "index.html";
  var STYLES = [
    { n: "Modern", d: "Clean · open" },
    { n: "Minimal", d: "Quiet · essential" },
    { n: "Luxury", d: "Rich · bespoke" },
    { n: "Scandinavian", d: "Warm · soft" },
    { n: "Contemporary", d: "Current · bold" }
  ];
  var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  // --- helpers ---
  function el(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function wireField(scope) {
    scope.querySelectorAll(".field input").forEach(function (inp) {
      var f = inp.closest(".field");
      inp.addEventListener("focus", function () { f.classList.add("focus"); });
      inp.addEventListener("blur", function () { f.classList.remove("focus"); });
    });
    scope.querySelectorAll(".field .toggle").forEach(function (t) {
      t.addEventListener("click", function () {
        var inp = t.closest(".field").querySelector("input");
        if (inp.type === "password") { inp.type = "text"; t.textContent = "Hide"; }
        else { inp.type = "password"; t.textContent = "Show"; }
      });
    });
  }
  function showErr(f, msg) { var e = f.querySelector(".err"); if (e) { e.textContent = msg || ""; e.classList.toggle("show", !!msg); } }
  function render(node) { root.innerHTML = ""; root.appendChild(node); wireField(root); }

  // ============ LOGIN ============
  function login() {
    var node = el('<div class="view"></div>');
    node.innerHTML =
      '<div class="eyebrow">Private Access</div>' +
      '<h2 class="p-title">Enter the <em>Atelier</em></h2>' +
      '<p class="p-lede">Welcome back. The studio is as you left it.</p>' +
      '<div class="fields">' +
        '<div class="field"><label>Email</label><input id="l_email" type="email" placeholder="you@residence.com" autocomplete="email"/><span class="ul"></span><div class="err"></div></div>' +
        '<div class="field"><label>Password</label><input id="l_pw" type="password" placeholder="Your private key"/><button class="toggle" type="button">Show</button><span class="ul"></span><div class="err"></div></div>' +
      "</div>" +
      '<div class="cta-row">' +
        '<button class="btn solid" id="l_go"><span class="lbl">Enter Studio</span> <span class="arw">\u2192</span><span class="prog"></span></button>' +
        '<button class="linkbtn" id="l_forgot">Forgot your key?</button>' +
      "</div>" +
      '<div class="alt-line"><span>Not yet a member?</span><button class="linkbtn" id="l_signup">Begin your design journey</button></div>';
    render(node);
    var go = node.querySelector("#l_go");
    var emailF = node.querySelector("#l_email").closest(".field");
    var pwF = node.querySelector("#l_pw").closest(".field");
    function submit() {
      var email = node.querySelector("#l_email").value.trim();
      var pw = node.querySelector("#l_pw").value;
      var ok = true;
      if (!emailRe.test(email)) { showErr(emailF, "A valid address, please"); ok = false; } else showErr(emailF, "");
      if (pw.length < 6) { showErr(pwF, "6 characters or more"); ok = false; } else showErr(pwF, "");
      if (!ok) return;
      go.classList.add("loading");
      go.querySelector(".lbl").textContent = "Unlocking";
      setTimeout(function () { welcome(email.split("@")[0]); }, 1500);
    }
    go.addEventListener("click", submit);
    node.querySelectorAll("input").forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); }); });
    node.querySelector("#l_forgot").addEventListener("click", forgot);
    node.querySelector("#l_signup").addEventListener("click", function () { signup(); });
    focusFirst();
  }

  // ============ WELCOME ============
  function welcome(name) {
    var node = el('<div class="view"></div>');
    node.innerHTML =
      '<svg class="seal"><use href="#logo"/></svg>' +
      '<div class="eyebrow">Access Granted</div>' +
      '<h2 class="p-title">Welcome,<br><em>' + (name || "Patron") + "</em></h2>" +
      '<p class="p-lede">The doors are open. Step inside \u2014 your atelier has been prepared.</p>' +
      '<div class="cta-row">' +
        '<button class="btn solid" id="w_go"><span class="lbl">Enter the Atelier</span> <span class="arw">\u2192</span></button>' +
        '<button class="linkbtn" id="w_out">\u2190 Sign out</button>' +
      "</div>";
    render(node);
    node.querySelector("#w_go").addEventListener("click", function () { document.body.style.transition = "opacity 0.6s"; document.body.style.opacity = "0"; setTimeout(function () { window.location.href = SITE; }, 600); });
    node.querySelector("#w_out").addEventListener("click", login);
  }

  // ============ FORGOT ============
  function forgot() {
    var node = el('<div class="view"></div>');
    node.innerHTML =
      '<div class="eyebrow brass">Concierge</div>' +
      '<h2 class="p-title">Misplaced<br>your <em>key</em>?</h2>' +
      '<p class="p-lede">Leave your address and we will quietly send a way back in.</p>' +
      '<div class="fields"><div class="field"><label>Email</label><input id="f_email" type="email" placeholder="you@residence.com" autocomplete="email"/><span class="ul"></span><div class="err"></div></div></div>' +
      '<div class="cta-row">' +
        '<button class="btn solid" id="f_go"><span class="lbl">Send a private link</span> <span class="arw">\u2192</span><span class="prog"></span></button>' +
        '<button class="linkbtn" id="f_back">\u2190 Back</button>' +
      "</div>";
    render(node);
    var go = node.querySelector("#f_go");
    var emailF = node.querySelector("#f_email").closest(".field");
    function submit() {
      var email = node.querySelector("#f_email").value.trim();
      if (!emailRe.test(email)) { showErr(emailF, "A valid address, please"); return; }
      showErr(emailF, "");
      go.classList.add("loading");
      go.querySelector(".lbl").textContent = "Sending";
      setTimeout(function () { sent(email); }, 1400);
    }
    go.addEventListener("click", submit);
    node.querySelector("#f_email").addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    node.querySelector("#f_back").addEventListener("click", login);
    focusFirst();
  }
  function sent(email) {
    var node = el('<div class="view"></div>');
    node.innerHTML =
      '<svg class="seal"><use href="#logo"/></svg>' +
      '<div class="eyebrow brass">Attended To</div>' +
      '<h2 class="p-title">Consider it<br><em>taken care of</em></h2>' +
      '<p class="p-lede">A private link is on its way to <span style="color:var(--azure-bright)">' + email + "</span>.</p>" +
      '<div class="cta-row"><button class="linkbtn" id="s_back">\u2190 Return to entrance</button></div>';
    render(node);
    node.querySelector("#s_back").addEventListener("click", login);
  }

  // ============ SIGNUP (multi-step) ============
  function signup() {
    var step = 0, total = 4;
    var data = { name: "", email: "", phone: "", style: "" };
    function draw() {
      var node = el('<div class="view"></div>');
      var pct = ((step + 1) / total) * 100;
      var head =
        '<div class="eyebrow">Begin Your Design Journey</div>' +
        '<div class="steps-head"><button class="back-mini" id="su_back">\u2190 ' + (step === 0 ? "Entrance" : "Back") + "</button>" +
          '<div class="steps-track"><div class="steps-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="ix"><b>0' + (step + 1) + "</b> \u2014 0" + total + "</div></div>";
      var body = "";
      if (step === 0) body = '<h2 class="p-title" style="font-size:clamp(28px,3.4vw,40px)">How shall we <em>address</em> you?</h2><div class="fields"><div class="field"><label>Full Name</label><input id="su_name" type="text" placeholder="e.g. Ananya Rao" value="' + esc(data.name) + '"/><span class="ul"></span><div class="err"></div></div></div>';
      else if (step === 1) body = '<h2 class="p-title" style="font-size:clamp(28px,3.4vw,40px)">Where may we send your <em>invitation</em>?</h2><div class="fields"><div class="field"><label>Email</label><input id="su_email" type="email" placeholder="you@residence.com" value="' + esc(data.email) + '"/><span class="ul"></span><div class="err"></div></div></div>';
      else if (step === 2) body = '<h2 class="p-title" style="font-size:clamp(28px,3.4vw,40px)">A line for our <em>concierge</em>?</h2><div class="fields"><div class="field"><label>Phone</label><input id="su_phone" type="tel" placeholder="+91 \u00b7\u00b7\u00b7\u00b7\u00b7" value="' + esc(data.phone) + '"/><span class="ul"></span><div class="err"></div></div></div>';
      else if (step === 3) {
        var opts = STYLES.map(function (s) {
          return '<button class="opt' + (data.style === s.n ? " sel" : "") + '" type="button" data-v="' + s.n + '"><span class="on">' + s.n + '</span><span class="od">' + s.d + "</span></button>";
        }).join("");
        body = '<h2 class="p-title" style="font-size:clamp(28px,3.4vw,40px)">Which language does your <em>space</em> speak?</h2><div class="opts" id="su_opts">' + opts + '</div><div class="field" style="margin-top:6px"><div class="err"></div></div>';
      }
      var cta = '<div class="cta-row"><button class="btn solid" id="su_next"><span class="lbl">' + (step === total - 1 ? "Begin" : "Continue") + '</span> <span class="arw">\u2192</span></button></div>';
      node.innerHTML = head + body + cta;
      render(node);

      node.querySelector("#su_back").addEventListener("click", function () { if (step === 0) login(); else { step--; draw(); } });
      var opts = node.querySelector("#su_opts");
      if (opts) opts.querySelectorAll(".opt").forEach(function (o) {
        o.addEventListener("click", function () {
          opts.querySelectorAll(".opt").forEach(function (x) { x.classList.remove("sel"); });
          o.classList.add("sel"); data.style = o.getAttribute("data-v");
        });
      });
      function next() {
        var f, val;
        if (step === 0) { f = node.querySelector("#su_name").closest(".field"); data.name = node.querySelector("#su_name").value.trim(); if (data.name.length < 2) return showErr(f, "Kindly share your name"); }
        if (step === 1) { f = node.querySelector("#su_email").closest(".field"); data.email = node.querySelector("#su_email").value.trim(); if (!emailRe.test(data.email)) return showErr(f, "A valid address, please"); }
        if (step === 2) { f = node.querySelector("#su_phone").closest(".field"); data.phone = node.querySelector("#su_phone").value.trim(); if (data.phone.replace(/\D/g, "").length < 7) return showErr(f, "A number we may reach you on"); }
        if (step === 3) { if (!data.style) { var e = node.querySelector(".err"); e.textContent = "Choose the language of your space"; e.classList.add("show"); return; } }
        if (step < total - 1) { step++; draw(); } else done();
      }
      node.querySelector("#su_next").addEventListener("click", next);
      node.querySelectorAll("input").forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") next(); }); });
      focusFirst();
    }
    function done() {
      var node = el('<div class="view"></div>');
      node.innerHTML =
        '<svg class="seal"><use href="#logo"/></svg>' +
        '<div class="eyebrow">Your Journey Begins</div>' +
        '<h2 class="p-title">A place is now<br><em>reserved</em> for you</h2>' +
        '<p class="p-lede">' + (data.name ? data.name.split(" ")[0] + ", a" : "A") + ' member of our studio will reach out to compose your first <span style="color:var(--azure-bright);font-style:italic">' + (data.style || "bespoke") + "</span> consultation.</p>" +
        '<div class="cta-row"><button class="btn solid" id="d_go"><span class="lbl">Enter the Atelier</span> <span class="arw">\u2192</span></button></div>';
      render(node);
      node.querySelector("#d_go").addEventListener("click", function () { document.body.style.transition = "opacity 0.6s"; document.body.style.opacity = "0"; setTimeout(function () { window.location.href = SITE; }, 600); });
    }
    draw();
  }

  function esc(s) { return (s || "").replace(/"/g, "&quot;"); }
  function focusFirst() {
    var inp = root.querySelector("input");
    if (inp) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 80);
  }

  // expose for engine (panel emerge can trigger first focus) + boot
  window.AURUM_AUTH = { login: login };
  login();
})();
