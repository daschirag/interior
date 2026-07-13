/* Hydrate public pages from Vinayak CMS API */
(function () {
  "use strict";

  if (!window.VINAYAK) return;

  if (document.querySelector("[data-cms-journey]") || document.querySelector("[data-cms-block]")) {
    window.VINAYAK_WAIT_CMS = true;
  }

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tt(key, fallback) {
    if (window.VINAYAK_I18N && typeof window.VINAYAK_I18N.t === "function") {
      var v = window.VINAYAK_I18N.t(key);
      if (v && v !== key) return v;
    }
    return fallback || key;
  }

  function assetUrl(url) {
    if (!url) return "";
    if (/^(https?:|data:|\/)/.test(url)) return url;
    return "/" + url.replace(/^\.\//, "");
  }

  function titleWithEm(title) {
    var parts = String(title || "").trim().split(/\s+/);
    if (parts.length <= 1) return esc(title);
    var last = parts.pop();
    return esc(parts.join(" ")) + " <em>" + esc(last) + "</em>";
  }

  function padNo(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function projectCover(project) {
    if (project.images && project.images.length) return assetUrl(project.images[0]);
    return "assets/images/img-panel-penthouse.jpg";
  }

  function projectTypeLabel(project) {
    if (project.project_type) return project.project_type;
    if (project.area_sqft) return project.area_sqft + " sq ft";
    return "Interior";
  }

  function applySiteSettings(settings) {
    if (!settings) return;

    document.querySelectorAll(".foot-col").forEach(function (col) {
      var h = col.querySelector("h4");
      if (
        !h ||
        (h.getAttribute("data-i18n-key") !== "footer.connect" &&
          h.textContent.trim() !== "Connect")
      ) {
        return;
      }

      col.querySelectorAll("a").forEach(function (a) {
        var href = a.getAttribute("href") || "";
        if (settings.email && href.indexOf("mailto:") === 0) {
          a.href = "mailto:" + settings.email;
          a.textContent = settings.email;
        }
        if (settings.phone && (href.indexOf("tel:") === 0 || a.textContent.indexOf("+91") !== -1)) {
          a.href = "tel:" + settings.phone.replace(/\s/g, "");
          a.textContent = settings.phone;
        }
      });

      if (settings.youtube_url) {
        var yt = col.querySelector(".foot-soc-yt");
        if (yt) yt.href = settings.youtube_url;
      }
      if (settings.facebook_url) {
        var fb = col.querySelector(".foot-soc-fb");
        if (fb) fb.href = settings.facebook_url;
      }
      if (settings.instagram_url) {
        var ig = col.querySelector(".foot-soc-ig");
        if (ig) ig.href = settings.instagram_url;
      }
    });

    if (settings.catalog_pdf_url) {
      document.querySelectorAll(".foot-iso").forEach(function (a) {
        a.href = assetUrl(settings.catalog_pdf_url);
      });
    }

    if (settings.studio_locations && settings.studio_locations.length) {
      var studiosCol = null;
      document.querySelectorAll(".foot-col").forEach(function (col) {
        var h = col.querySelector("h4");
        if (
          h &&
          (h.getAttribute("data-i18n-key") === "footer.studios" ||
            h.textContent.trim() === "Studios")
        ) {
          studiosCol = col;
        }
      });
      if (studiosCol) {
        var links = studiosCol.querySelectorAll("a");
        settings.studio_locations.forEach(function (loc, i) {
          if (!links[i]) return;
          var city = loc.city || loc.name || "";
          links[i].textContent = city;
          links[i].href = "Contact.html#locations";
        });
      }
    }

    if (settings.email) {
      document.querySelectorAll('.direct a[href^="mailto:"]').forEach(function (a) {
        a.href = "mailto:" + settings.email;
        a.textContent = settings.email;
      });
    }
    if (settings.phone) {
      document.querySelectorAll('.direct a[href^="tel:"]').forEach(function (a) {
        a.href = "tel:" + settings.phone.replace(/\s/g, "");
        a.textContent = settings.phone;
      });
    }
  }

  function hydrateFeatured() {
    var row = document.querySelector("[data-cms-featured]");
    if (!row) return Promise.resolve();

    return VINAYAK.getProjects(true)
      .then(function (res) {
        if (!res.success || !res.projects || !res.projects.length) return;
        row.innerHTML = res.projects.slice(0, 3).map(function (p, i) {
          var cover = projectCover(p);
          var loc = p.location || "";
          var typeLabel = p.project_type || projectTypeLabel(p);
          var sub = typeLabel + (loc ? " · " + loc : "");
          return (
            '<a class="proj-card" href="Projects.html" data-reveal data-project-id="' +
            esc(String(p.id)) +
            '">' +
            '<div class="pf ticks"><div class="ph lazy-bg" data-lazy-bg="' + esc(cover) + '" style="background-size:cover;background-position:center;">' +
            '<span class="ph-tag"><span class="a">◐ PROJECT</span><span class="b">' + esc(p.title) + "</span></span></div></div>" +
            '<div class="pmeta"><span class="pt">' + esc(p.title) + '</span><span class="pn">' + padNo(i + 1) + "</span></div>" +
            '<div class="pl">' + esc(sub) + "</div></a>"
          );
        }).join("");
        if (window.AURUM && AURUM.refreshReveals) AURUM.refreshReveals(row);
        if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
      })
      .catch(function () {});
  }

  function buildJourneyPanelHtml(p, i, total) {
    var tags = (p.material_tags || [])
      .map(function (t) {
        return "<span>" + esc(t) + "</span>";
      })
      .join("");

    return (
      '<article class="hpanel" data-cms-project="" data-project-id="' +
      esc(String(p.id)) +
      '" data-cms-edit-label="' +
      esc(p.title || "Project") +
      '">' +
      '<div class="hpanel-media"><div class="ph ticks lazy-bg" data-lazy-bg="' +
      esc(projectCover(p)) +
      '" style="position:absolute;inset:0;"></div></div>' +
      '<div class="hpanel-body">' +
      '<div class="hpanel-no">' +
      padNo(i + 1) +
      " / " +
      padNo(total) +
      "</div>" +
      '<h3 class="hpanel-ttl">' +
      titleWithEm(p.title) +
      "</h3>" +
      '<div class="hpanel-meta">' +
      '<div><div class="a">Area</div><div class="b">' +
      esc(projectTypeLabel(p)) +
      "</div></div>" +
      '<div><div class="a">City</div><div class="b">' +
      esc(p.location || "—") +
      "</div></div>" +
      '<div><div class="a">Year</div><div class="b">' +
      esc(p.year || "—") +
      "</div></div></div>" +
      '<p class="hpanel-desc">' +
      esc(p.description || "") +
      "</p>" +
      '<div class="hpanel-tags">' +
      tags +
      "</div></div></article>"
    );
  }

  function hydrateJourney() {
    var track = document.querySelector("[data-cms-journey]");
    if (!track) return Promise.resolve();

    return VINAYAK.getProjects()
      .then(function (res) {
        if (!res.success || !res.projects || !res.projects.length) return;
        var projects = res.projects;
        track.querySelectorAll(".hpanel").forEach(function (el) {
          el.remove();
        });

        var intro = track.querySelector(".hpanel-intro");
        if (intro && !intro.getAttribute("data-cms-block")) {
          var h2 = intro.querySelector(".h2");
          if (h2) {
            var n = projects.length;
            h2.innerHTML =
              '<span>' +
              n +
              " home" +
              (n === 1 ? "" : "s") +
              ', <span class="brass">told</span> left to right.</span>';
          }
        }

        projects.forEach(function (p, i) {
          window.VINAYAK_CMS_PROJECTS = window.VINAYAK_CMS_PROJECTS || {};
          window.VINAYAK_CMS_PROJECTS[p.id] = p;
          var wrap = document.createElement("div");
          wrap.innerHTML = buildJourneyPanelHtml(p, i, projects.length);
          track.appendChild(wrap.firstElementChild);
        });

        var baProject = projects.find(function (p) {
          return p.before_image_url && p.after_image_url;
        });

        var transformBlock =
          window.VINAYAK_CMS_BLOCKS &&
          window.VINAYAK_CMS_BLOCKS["projects-transformation"];
        var blockImages = (transformBlock && transformBlock.images) || [];
        var blockAfter = blockImages.find(function (i) {
          return i.key === "ba-after" && i.url;
        });
        var blockBefore = blockImages.find(function (i) {
          return i.key === "ba-before" && i.url;
        });

        if (baProject || blockAfter || blockBefore) {
          var baCaption = document.querySelector(
            '[data-cms-block="projects-transformation"] [data-cms-field="caption"]',
          );
          if (baCaption && baProject && !baCaption.textContent.trim()) {
            baCaption.textContent =
              baProject.title +
              " — the living room, as found and as composed. Pull the divider.";
          }
          var baAfter = document.getElementById("baAfter");
          var baBeforeInner = document.getElementById("baBeforeInner");
          if (baAfter) {
            var afterUrl = blockAfter
              ? assetUrl(blockAfter.url)
              : baProject
                ? assetUrl(baProject.after_image_url)
                : null;
            if (afterUrl) baAfter.setAttribute("data-lazy-bg", afterUrl);
          }
          if (baBeforeInner) {
            var beforeUrl = blockBefore
              ? assetUrl(blockBefore.url)
              : baProject
                ? assetUrl(baProject.before_image_url)
                : null;
            if (beforeUrl) baBeforeInner.setAttribute("data-lazy-bg", beforeUrl);
          }
        }
      })
      .catch(function () {});
  }

  function wireDisciplineAccordion() {
    if (document.documentElement.classList.contains("cms-edit-mode")) return;
    var rows = document.querySelectorAll("#svcList .svc-row");
    var expands = document.querySelectorAll("#svcList .svc-expand");
    var svcHint = document.querySelector(".svc-hint");
    rows.forEach(function (row) {
      if (row.dataset.svcWired) return;
      row.dataset.svcWired = "1";
      row.addEventListener("click", function () {
        var id = row.getAttribute("data-svc");
        var panel = document.querySelector('.svc-expand[data-for="' + id + '"]');
        if (!panel) return;
        var isOpen = panel.classList.contains("open");
        expands.forEach(function (e) {
          e.classList.remove("open");
        });
        rows.forEach(function (r) {
          r.classList.remove("open");
        });
        if (!isOpen) {
          panel.classList.add("open");
          row.classList.add("open");
          if (svcHint) svcHint.classList.add("is-dismissed");
        }
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          row.click();
        }
      });
    });
    document.querySelectorAll(".svc-expand-cta .svc-view-projects").forEach(function (a) {
      if (a.getAttribute("href") === "#" || a.getAttribute("aria-disabled") === "true") {
        a.addEventListener("click", function (e) {
          if (a.getAttribute("href") === "#") e.preventDefault();
        });
      }
    });
  }

  function buildDisciplineItemHtml(d, i) {
    var meta = d.subtitle || d.budget_range || "";
    var kicker = d.subtitle || "";
    var headline = d.headline || titleWithEm(d.title);
    var bodyCopy = d.description || "";
    var scopeLabel = d.scope || "";
    var features = (d.tags || [])
      .map(function (t) {
        return "<span>" + esc(t) + "</span>";
      })
      .join("");
    var projectsLink = d.cta_projects_link || "Projects.html";
    var consultLink = d.cta_consult_link || "Contact.html";
    var img = assetUrl(d.image_url) || "assets/images/img-svc-1bhk.jpg";
    var id = String(i);
    var labelBudget = tt("studio.budget", "Budget Range");
    var labelTimeline = tt("studio.timeline", "Timeline");
    var labelScope = tt("studio.scope", "Scope");
    var labelProjects = tt("studio.view_projects", "View Projects");
    var labelConsult = tt("studio.book_consult", "Book Consultation");

    return (
      '<div class="svc-item" data-cms-discipline data-discipline-id="' +
      d.id +
      '" data-cms-edit-label="' +
      esc(d.title) +
      '">' +
      '<div class="svc-row" data-svc="' +
      id +
      '" tabindex="0">' +
      '<span class="svc-no">' +
      padNo(i + 1) +
      "</span>" +
      '<span class="svc-name">' +
      titleWithEm(d.title) +
      "</span>" +
      '<span class="svc-meta">' +
      esc(meta) +
      '</span><span class="svc-indicator"><span class="ind-line"></span><span class="ind-arrow" aria-hidden="true">+</span></span></div>' +
      '<div class="svc-expand" data-for="' +
      id +
      '"><div class="svc-expand-inner">' +
      '<div class="svc-expand-media"><div class="ph ticks lazy-bg" data-lazy-bg="' +
      esc(img) +
      '" style="position:absolute;inset:0;"></div><div class="svc-expand-media-overlay"></div></div>' +
      '<div class="svc-expand-body">' +
      '<div class="svc-expand-kicker">' +
      esc(kicker) +
      "</div>" +
      '<h3 class="svc-expand-title">' +
      headline +
      "</h3>" +
      '<p class="svc-expand-desc">' +
      esc(bodyCopy) +
      "</p>" +
      '<div class="svc-expand-specs">' +
      (d.budget_range
        ? '<div class="svc-spec"><div class="ss-k">' +
          esc(labelBudget) +
          '</div><div class="ss-v">' +
          esc(d.budget_range) +
          "</div></div>"
        : "") +
      (d.timeline
        ? '<div class="svc-spec"><div class="ss-k">' +
          esc(labelTimeline) +
          '</div><div class="ss-v">' +
          esc(d.timeline) +
          "</div></div>"
        : "") +
      (scopeLabel
        ? '<div class="svc-spec"><div class="ss-k">' +
          esc(labelScope) +
          '</div><div class="ss-v">' +
          esc(scopeLabel) +
          "</div></div>"
        : "") +
      "</div>" +
      '<div class="svc-expand-features">' +
      features +
      "</div>" +
      '<div class="svc-expand-cta">' +
      '<a class="btn solid svc-view-projects" href="' +
      esc(projectsLink) +
      '">' +
      esc(labelProjects) +
      ' <span class="arw">&#8594;</span></a>' +
      '<a class="btn" href="' +
      esc(consultLink) +
      '">' +
      esc(labelConsult) +
      ' <span class="arw">&#8594;</span></a>' +
      "</div></div></div></div></div>"
    );
  }

  function hydrateDisciplines() {
    var list = document.querySelector("[data-cms-disciplines]");
    if (!list) return Promise.resolve();

    return VINAYAK.getDisciplines()
      .then(function (res) {
        if (!res.success || !res.disciplines || !res.disciplines.length) return;
        var disciplines = res.disciplines;
        window.VINAYAK_CMS_DISCIPLINES = {};
        var html = "";

        disciplines.forEach(function (d, i) {
          window.VINAYAK_CMS_DISCIPLINES[d.id] = d;
          html += buildDisciplineItemHtml(d, i);
        });

        list.innerHTML = html;
        wireDisciplineAccordion();
      })
      .catch(function () {});
  }

  function renderStudio(loc, index) {
    var city = loc.city || loc.name || "Studio";
    var brand = loc.brand || "Vinayak Aluminium Interiors";
    var addr = loc.address || "";
    var hours = loc.hours || loc.business_hours || "";
    var maps = loc.maps_url || loc.google_maps_url || loc.maps || "#";
    var phone = loc.phone || "";
    var phoneLabel = loc.phone_display || phone;

    return (
      '<article class="loc" data-studio-id="' +
      esc(String(loc.id || "")) +
      '">' +
      '<div class="loc-top"><span class="lno">' +
      padNo(index + 1) +
      '</span><h3 class="loc-city">' +
      esc(city) +
      "</h3></div>" +
      '<div class="loc-body"><p class="loc-brand">' +
      esc(brand) +
      '</p><p class="loc-addr">' +
      esc(addr) +
      '</p><ul class="loc-meta">' +
      (hours
        ? '<li><span class="lm-k">Hours</span><span class="lm-v">' + esc(hours) + "</span></li>"
        : "") +
      '</ul></div><div class="loc-actions">' +
      '<a class="loc-btn loc-btn--maps" href="' +
      esc(maps) +
      '" target="_blank" rel="noopener noreferrer" aria-label="Get directions to ' +
      esc(city) +
      ' studio in Google Maps">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>' +
      '<span class="loc-btn-label">Get directions</span>' +
      '<span class="loc-btn-hint">Opens in Google Maps · turn-by-turn route</span></a>' +
      (phone
        ? (function () {
            var digits = String(phone).replace(/\D/g, "");
            if (digits.length === 10) digits = "91" + digits;
            var waText = encodeURIComponent(
              "Hi, I'm interested in interior design services at your " +
                city +
                " studio",
            );
            return (
              '<a class="loc-btn loc-btn--call" href="tel:' +
              esc(phone.replace(/\s/g, "")) +
              '" aria-label="Call ' +
              esc(city) +
              ' studio">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>' +
              '<span class="loc-btn-label">Call ' +
              esc(phoneLabel) +
              "</span></a>" +
              '<a class="loc-btn loc-btn--wa" href="https://wa.me/' +
              esc(digits) +
              "?text=" +
              waText +
              '" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ' +
              esc(city) +
              ' studio">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.28-.14-1.64-.81-1.9-.9-.25-.1-.44-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.64-1.54-1.92-.16-.27-.02-.42.12-.56.13-.13.28-.32.42-.49.14-.16.18-.27.28-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3s.98 2.67 1.12 2.85c.14.18 1.93 2.95 4.68 4.13.65.28 1.16.45 1.56.58.65.21 1.25.18 1.72.11.52-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.59.94.96-3.5-.22-.36a9.45 9.45 0 0 1-1.45-5.04 9.5 9.5 0 0 1 9.5-9.48c2.54 0 4.93.99 6.73 2.79a9.46 9.46 0 0 1 2.78 6.72 9.5 9.5 0 0 1-9.53 9.45zm8.14-17.6A11.2 11.2 0 0 0 12.03 0C5.43 0 .07 5.35.07 11.94c0 2.1.55 4.15 1.6 5.96L0 24l6.26-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.6 0 11.96-5.36 11.96-11.95 0-3.19-1.24-6.19-3.5-8.45z"/></svg>' +
              '<span class="loc-btn-label">WhatsApp</span></a>'
            );
          })()
        : "") +
      "</div></article>"
    );
  }

  function contentPageSlug() {
    var fromBody = document.body && document.body.getAttribute("data-cms-page");
    if (fromBody) return String(fromBody).toLowerCase();
    var file = (window.location.pathname || "").split("/").pop() || "index.html";
    if (file.toLowerCase() === "dashboard.html") return "dashboard";
    return file.replace(/\.html$/i, "").toLowerCase();
  }

  function normalizeHtml(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function applyContentBlock(block, optionalRoot) {
    if (!block || !block.section_key) return;
    var root =
      optionalRoot ||
      document.querySelector(
        '[data-cms-block="' + block.section_key + '"]',
      );
    if (!root) return;

    var fields = block.fields || {};
    root.querySelectorAll("[data-cms-field]").forEach(function (el) {
      var key = el.getAttribute("data-cms-field");
      if (fields[key] == null || fields[key] === "") return;
      if (el.getAttribute("data-cms-html") === "true") {
        var nextHtml = fields[key];
        if (normalizeHtml(el.innerHTML) === normalizeHtml(nextHtml)) return;
        el.innerHTML = nextHtml;
      } else if (el.tagName === "A") {
        if (el.textContent !== String(fields[key])) {
          el.textContent = fields[key];
        }
        var hrefField = el.getAttribute("data-cms-href-field");
        if (hrefField === key || !hrefField) {
          var prefix = el.getAttribute("data-cms-href-prefix") || "";
          if (prefix === "mailto:") {
            el.href = "mailto:" + String(fields[key]).trim();
          } else if (prefix === "tel:") {
            el.href =
              "tel:" + String(fields[key]).replace(/[^\d+]/g, "");
          } else if (prefix) {
            el.href = prefix + String(fields[key]);
          }
        }
      } else {
        if (el.textContent === String(fields[key])) return;
        el.textContent = fields[key];
      }
    });

    (block.images || []).forEach(function (img) {
      if (!img || !img.key || !img.url) return;
      var url = assetUrl(img.url);
      root.querySelectorAll('[data-cms-image="' + img.key + '"]').forEach(function (el) {
        if (el.tagName === "IMG") {
          el.src = url;
        } else {
          el.setAttribute("data-lazy-bg", url);
          el.style.backgroundImage = "url(" + url + ")";
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
        }
      });
    });
  }

  function hydrateContentBlocks() {
    if (!document.querySelector("[data-cms-block]")) {
      return Promise.resolve();
    }

    var page = contentPageSlug();
    if (!page) return Promise.resolve();

    return VINAYAK.getContentBlocks(page)
      .then(function (res) {
        if (!res.success || !res.blocks || !res.blocks.length) return;
        window.VINAYAK_CMS_BLOCKS = window.VINAYAK_CMS_BLOCKS || {};
        res.blocks.forEach(function (block) {
          window.VINAYAK_CMS_BLOCKS[block.section_key] = {
            section_key: block.section_key,
            section_label: block.section_label,
            page: block.page,
            fields: JSON.parse(JSON.stringify(block.fields || {})),
            images: JSON.parse(JSON.stringify(block.images || [])),
          };
          applyContentBlock(block);
        });
      })
      .catch(function () {});
  }

  function hydrateStudios() {
    var grid = document.querySelector("[data-cms-studios]");
    if (!grid) return Promise.resolve();

    return VINAYAK.getStudios()
      .then(function (res) {
        if (!res.success || !res.studios || !res.studios.length) {
          return hydrateStudiosFromSettings();
        }
        grid.innerHTML = res.studios.map(renderStudio).join("");
        var heading = document.querySelector("[data-cms-studios-count]");
        if (heading) {
          var n = res.studios.length;
          heading.innerHTML =
            '<span>' +
            n +
            " cit" +
            (n === 1 ? "y" : "ies") +
            ', <em>one</em> standard.</span>';
        }
        document.querySelectorAll(".foot-col").forEach(function (col) {
          var h = col.querySelector("h4");
          if (
            h &&
            (h.getAttribute("data-i18n-key") === "footer.studios" ||
              h.textContent.trim() === "Studios")
          ) {
            var links = col.querySelectorAll("a");
            res.studios.forEach(function (loc, i) {
              if (links[i]) links[i].textContent = loc.city;
            });
          }
        });
      })
      .catch(function () {
        return hydrateStudiosFromSettings();
      });
  }

  function hydrateStudiosFromSettings(settings) {
    var grid = document.querySelector("[data-cms-studios]");
    if (!grid) return Promise.resolve();

    var load =
      settings != null
        ? Promise.resolve({ success: true, settings: settings })
        : VINAYAK.getSiteSettings();

    return load
      .then(function (res) {
        if (!res.success || !res.settings || !res.settings.studio_locations) return;
        if (!res.settings.studio_locations.length) return;
        grid.innerHTML = res.settings.studio_locations.map(renderStudio).join("");
        var heading = document.querySelector("[data-cms-studios-count]");
        if (heading) {
          var n = res.settings.studio_locations.length;
          heading.innerHTML =
            '<span>' +
            n +
            " cit" +
            (n === 1 ? "y" : "ies") +
            ', <em>one</em> standard.</span>';
        }
      })
      .catch(function () {});
  }

  function hydrateAll() {
    var tasks = [VINAYAK.trackPageView()];

    var settingsTask = VINAYAK.getSiteSettings()
      .then(function (res) {
        if (res.success && res.settings) {
          applySiteSettings(res.settings);
        }
      })
      .catch(function () {});

    tasks.push(settingsTask);
    tasks.push(hydrateStudios());
    tasks.push(hydrateFeatured());
    tasks.push(hydrateDisciplines());

    return Promise.all(tasks)
      .then(function () {
        return hydrateContentBlocks();
      })
      .then(function () {
        return hydrateJourney();
      })
      .then(function () {
      if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
      if (window.AURUM && AURUM.initManifestoScroll) AURUM.initManifestoScroll();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh(true);
      window.dispatchEvent(new Event("vinayak:cms-ready"));
    });
  }

  function rehydrateForLang() {
    return Promise.all([
      hydrateStudios(),
      hydrateFeatured(),
      hydrateDisciplines(),
      hydrateContentBlocks().then(function () {
        return hydrateJourney();
      }),
    ]).then(function () {
      if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
      if (window.AURUM && AURUM.initManifestoScroll) AURUM.initManifestoScroll();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh(true);
      if (window.VINAYAK_I18N && VINAYAK_I18N.apply) VINAYAK_I18N.apply();
      window.dispatchEvent(new Event("vinayak:cms-ready"));
    });
  }

  window.VINAYAK_CMS_READY = (
    window.VINAYAK_I18N && VINAYAK_I18N.init
      ? VINAYAK_I18N.init()
      : Promise.resolve()
  ).then(function () {
    return hydrateAll();
  });

  window.addEventListener("vinayak:langchange", function () {
    rehydrateForLang();
  });

  window.VINAYAK_CMS_REFRESH = {
    disciplines: hydrateDisciplines,
    journey: hydrateJourney,
    contentBlocks: hydrateContentBlocks,
    all: rehydrateForLang,
  };

  window.VINAYAK_CMS_APPLY = {
    applyContentBlock: applyContentBlock,
    contentPageSlug: contentPageSlug,
    assetUrl: assetUrl,
    esc: esc,
    projectCover: projectCover,
    projectTypeLabel: projectTypeLabel,
    padNo: padNo,
    titleWithEm: titleWithEm,
    renderStudio: renderStudio,
    buildJourneyPanelHtml: buildJourneyPanelHtml,
    buildDisciplineItemHtml: buildDisciplineItemHtml,
    wireDisciplineAccordion: wireDisciplineAccordion,
  };
})();
