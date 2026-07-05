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
      if (!h || h.textContent.trim() !== "Connect") return;

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
        if (h && h.textContent.trim() === "Studios") studiosCol = col;
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
            '<a class="proj-card" href="Projects.html" data-reveal>' +
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
        if (intro) {
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
          var tags = (p.material_tags || [])
            .map(function (t) {
              return "<span>" + esc(t) + "</span>";
            })
            .join("");
          var article = document.createElement("article");
          article.className = "hpanel";
          article.setAttribute("data-cms-project", "");
          article.setAttribute("data-project-id", String(p.id));
          article.setAttribute("data-cms-edit-label", p.title || "Project");
          window.VINAYAK_CMS_PROJECTS = window.VINAYAK_CMS_PROJECTS || {};
          window.VINAYAK_CMS_PROJECTS[p.id] = p;
          article.innerHTML =
            '<div class="hpanel-media"><div class="ph ticks lazy-bg" data-lazy-bg="' +
            esc(projectCover(p)) +
            '" style="position:absolute;inset:0;"></div></div>' +
            '<div class="hpanel-body">' +
            '<div class="hpanel-no">' +
            padNo(i + 1) +
            " / " +
            padNo(projects.length) +
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
            "</div></div>";
          track.appendChild(article);
        });

        var baProject = projects.find(function (p) {
          return p.before_image_url && p.after_image_url;
        });
        if (baProject) {
          var baCaption = document.querySelector("[data-cms-ba-caption]");
          if (baCaption) {
            baCaption.textContent =
              baProject.title + " — the living room, as found and as composed. Pull the divider.";
          }
          var baAfter = document.getElementById("baAfter");
          var baBeforeInner = document.getElementById("baBeforeInner");
          if (baAfter) baAfter.setAttribute("data-lazy-bg", assetUrl(baProject.after_image_url));
          if (baBeforeInner) baBeforeInner.setAttribute("data-lazy-bg", assetUrl(baProject.before_image_url));
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
          var id = String(i);
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

          html +=
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
              ? '<div class="svc-spec"><div class="ss-k">Budget Range</div><div class="ss-v">' +
                esc(d.budget_range) +
                "</div></div>"
              : "") +
            (d.timeline
              ? '<div class="svc-spec"><div class="ss-k">Timeline</div><div class="ss-v">' +
                esc(d.timeline) +
                "</div></div>"
              : "") +
            (scopeLabel
              ? '<div class="svc-spec"><div class="ss-k">Scope</div><div class="ss-v">' +
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
            '">View Projects <span class="arw">&#8594;</span></a>' +
            '<a class="btn" href="' +
            esc(consultLink) +
            '">Book Consultation <span class="arw">&#8594;</span></a>' +
            "</div></div></div></div></div>";
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
    var coords = loc.coordinates || "";
    var maps = loc.maps_url || loc.google_maps_url || loc.maps || "#";
    var phone = loc.phone || "";
    var phoneLabel = loc.phone_display || phone;

    return (
      '<article class="loc">' +
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
      (coords
        ? '<li><span class="lm-k">Coordinates</span><span class="lm-v">' + esc(coords) + "</span></li>"
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
        ? '<a class="loc-btn loc-btn--call" href="tel:' +
          esc(phone.replace(/\s/g, "")) +
          '" aria-label="Call ' +
          esc(city) +
          ' studio">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"/></svg>' +
          '<span class="loc-btn-label">Call ' +
          esc(phoneLabel) +
          "</span></a>"
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

  function applyContentBlock(block) {
    if (!block || !block.section_key) return;
    var root = document.querySelector(
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
          window.VINAYAK_CMS_BLOCKS[block.section_key] = block;
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
          if (h && h.textContent.trim() === "Studios") {
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
    tasks.push(hydrateJourney());
    tasks.push(hydrateDisciplines());
    tasks.push(hydrateContentBlocks());

    return Promise.all(tasks).then(function () {
      if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh(true);
      window.dispatchEvent(new Event("vinayak:cms-ready"));
    });
  }

  window.VINAYAK_CMS_READY = hydrateAll();

  window.VINAYAK_CMS_REFRESH = {
    disciplines: hydrateDisciplines,
    journey: hydrateJourney,
    contentBlocks: hydrateContentBlocks,
  };
})();
