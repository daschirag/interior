/* CMS visual editor — iframe edit mode (dormant unless parent enables) */
(function () {
  "use strict";

  var editMode = false;
  var styleEl = null;
  var hovered = null;

  function inIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  function assetUrl(url) {
    if (!url) return "";
    if (/^(https?:|data:|\/)/.test(url)) return url;
    return "/" + url.replace(/^\.\//, "");
  }

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function titleWithEm(title) {
    var parts = String(title || "").trim().split(/\s+/);
    if (parts.length <= 1) return esc(title);
    var last = parts.pop();
    return esc(parts.join(" ")) + " <em>" + esc(last) + "</em>";
  }

  function normalizeHtml(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function editableTarget(el) {
    return el.closest("[data-cms-discipline], [data-cms-project], [data-cms-block]");
  }

  function getCachedBlock(sectionKey) {
    if (!window.VINAYAK_CMS_BLOCKS || !window.VINAYAK_CMS_BLOCKS[sectionKey]) {
      return null;
    }
    var block = window.VINAYAK_CMS_BLOCKS[sectionKey];
    return {
      sectionKey: block.section_key,
      sectionLabel: block.section_label,
      fields: JSON.parse(JSON.stringify(block.fields || {})),
      images: JSON.parse(JSON.stringify(block.images || [])),
    };
  }

  function sectionLabelFor(el) {
    return (
      el.getAttribute("data-cms-edit-label") ||
      el.getAttribute("data-cms-block") ||
      "Section"
    );
  }

  function injectStyles() {
    if (styleEl) return;
    styleEl = document.createElement("style");
    styleEl.id = "cms-edit-mode-styles";
    styleEl.textContent =
      ".cms-edit-mode .cur-ring,.cms-edit-mode .cur-dot,.cms-edit-mode .torch{display:none!important}" +
      ".cms-edit-mode [data-cms-block],.cms-edit-mode [data-cms-discipline],.cms-edit-mode [data-cms-project]{position:relative;cursor:pointer;pointer-events:auto}" +
      ".cms-edit-mode [data-cms-block] *,.cms-edit-mode [data-cms-discipline] *,.cms-edit-mode [data-cms-project] *{pointer-events:none}" +
      "[data-cms-block].cms-edit-hover,[data-cms-discipline].cms-edit-hover,[data-cms-project].cms-edit-hover{outline:2px solid #2c9ad4;outline-offset:4px}" +
      "[data-cms-block].cms-edit-selected,[data-cms-discipline].cms-edit-selected,[data-cms-project].cms-edit-selected{outline:2px solid #c2a269;outline-offset:4px}" +
      ".cms-edit-badge{position:absolute;top:12px;right:12px;z-index:40;font:500 10px/1 Jost,sans-serif;" +
      "letter-spacing:.14em;text-transform:uppercase;background:rgba(44,154,212,.92);color:#041018;" +
      "padding:6px 10px;border-radius:2px;pointer-events:none;}" +
      ".cms-edit-mode-banner{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:90;" +
      "font:500 11px/1.4 Jost,sans-serif;letter-spacing:.06em;background:rgba(8,12,18,.92);" +
      "color:#b8c5d6;border:1px solid rgba(44,154,212,.35);padding:10px 16px;border-radius:999px;" +
      "pointer-events:none;box-shadow:0 12px 40px rgba(0,0,0,.45);}";
    document.head.appendChild(styleEl);
  }

  function ensureBanner() {
    if (document.getElementById("cms-edit-mode-banner")) return;
    var banner = document.createElement("div");
    banner.id = "cms-edit-mode-banner";
    banner.className = "cms-edit-mode-banner";
    banner.textContent = "Edit mode — click a section, discipline, or project";
    document.body.appendChild(banner);
  }

  function clearHover() {
    if (!hovered) return;
    hovered.classList.remove("cms-edit-hover");
    var badge = hovered.querySelector(".cms-edit-badge");
    if (badge) badge.remove();
    hovered = null;
  }

  function clearSelected() {
    document
      .querySelectorAll(".cms-edit-selected")
      .forEach(function (el) {
        el.classList.remove("cms-edit-selected");
      });
  }

  function setHover(el) {
    if (hovered === el) return;
    clearHover();
    if (!el) return;
    hovered = el;
    hovered.classList.add("cms-edit-hover");
    if (!hovered.querySelector(".cms-edit-badge")) {
      var badge = document.createElement("span");
      badge.className = "cms-edit-badge";
      badge.textContent = sectionLabelFor(hovered);
      if (getComputedStyle(hovered).position === "static") {
        hovered.style.position = "relative";
      }
      hovered.appendChild(badge);
    }
  }

  function announceCatalog() {
    var sections = [];
    document.querySelectorAll("[data-cms-block]").forEach(function (el) {
      sections.push({
        sectionKey: el.getAttribute("data-cms-block"),
        sectionLabel: sectionLabelFor(el),
      });
    });

    var disciplines = [];
    document.querySelectorAll("[data-cms-discipline]").forEach(function (el) {
      disciplines.push({
        id: el.getAttribute("data-discipline-id"),
        title: el.getAttribute("data-cms-edit-label") || "Discipline",
      });
    });

    var projects = [];
    document.querySelectorAll("[data-cms-project]").forEach(function (el) {
      projects.push({
        id: el.getAttribute("data-project-id"),
        title: el.getAttribute("data-cms-edit-label") || "Project",
      });
    });

    window.parent.postMessage(
      {
        type: "CMS_EDITOR_CATALOG_READY",
        sections: sections,
        disciplines: disciplines,
        projects: projects,
      },
      "*",
    );
  }

  function sendBlockSelection(payload) {
    clearSelected();
    var root = document.querySelector('[data-cms-block="' + payload.sectionKey + '"]');
    if (root) root.classList.add("cms-edit-selected");
    window.parent.postMessage(
      Object.assign({ type: "CMS_SECTION_CLICKED" }, payload),
      "*",
    );
  }

  function sendDisciplineSelection(id, discipline) {
    clearSelected();
    var root = document.querySelector('[data-discipline-id="' + id + '"]');
    if (root) {
      root.classList.add("cms-edit-selected");
      openDisciplinePanel(root);
    }
    window.parent.postMessage(
      {
        type: "CMS_DISCIPLINE_CLICKED",
        id: id,
        title: discipline.title,
        discipline: discipline,
      },
      "*",
    );
  }

  function sendProjectSelection(id, project) {
    clearSelected();
    var root = document.querySelector('[data-project-id="' + id + '"]');
    if (root) root.classList.add("cms-edit-selected");
    window.parent.postMessage(
      {
        type: "CMS_PROJECT_CLICKED",
        id: id,
        title: project.title,
        project: project,
      },
      "*",
    );
  }

  function openDisciplinePanel(root) {
    document.querySelectorAll("#svcList .svc-expand.open").forEach(function (el) {
      el.classList.remove("open");
    });
    document.querySelectorAll("#svcList .svc-row.open").forEach(function (el) {
      el.classList.remove("open");
    });
    var row = root.querySelector(".svc-row");
    var panel = root.querySelector(".svc-expand");
    if (row) row.classList.add("open");
    if (panel) panel.classList.add("open");
  }

  function selectBlock(block) {
    if (!block) return;
    var sectionKey = block.getAttribute("data-cms-block");
    if (!sectionKey) return;
    var cached = getCachedBlock(sectionKey);
    if (cached) {
      sendBlockSelection(cached);
      return;
    }
    if (!window.VINAYAK || !window.VINAYAK.getContentBlock) return;
    window.VINAYAK.getContentBlock(sectionKey).then(function (res) {
      if (!res || !res.success || !res.block) return;
      window.VINAYAK_CMS_BLOCKS = window.VINAYAK_CMS_BLOCKS || {};
      window.VINAYAK_CMS_BLOCKS[sectionKey] = res.block;
      var payload = getCachedBlock(sectionKey);
      if (payload) sendBlockSelection(payload);
    });
  }

  function selectDiscipline(el) {
    if (!el) return;
    var id = el.getAttribute("data-discipline-id");
    if (!id) return;
    var cached =
      window.VINAYAK_CMS_DISCIPLINES && window.VINAYAK_CMS_DISCIPLINES[id];
    if (cached) {
      sendDisciplineSelection(id, JSON.parse(JSON.stringify(cached)));
    }
  }

  function selectProject(el) {
    if (!el) return;
    var id = el.getAttribute("data-project-id");
    if (!id) return;
    var cached = window.VINAYAK_CMS_PROJECTS && window.VINAYAK_CMS_PROJECTS[id];
    if (cached) {
      sendProjectSelection(id, JSON.parse(JSON.stringify(cached)));
    }
  }

  function onMouseOver(e) {
    if (!editMode) return;
    var target = editableTarget(e.target);
    if (target) setHover(target);
    else clearHover();
  }

  function onClick(e) {
    if (!editMode) return;
    var discipline = e.target.closest("[data-cms-discipline]");
    if (discipline) {
      e.preventDefault();
      e.stopPropagation();
      selectDiscipline(discipline);
      return;
    }
    var project = e.target.closest("[data-cms-project]");
    if (project) {
      e.preventDefault();
      e.stopPropagation();
      selectProject(project);
      return;
    }
    var block = e.target.closest("[data-cms-block]");
    if (block) {
      e.preventDefault();
      e.stopPropagation();
      selectBlock(block);
    }
  }

  function projectTypeLabel(project) {
    if (project.project_type) return project.project_type;
    if (project.area_sqft) return project.area_sqft + " sq ft";
    return "Interior";
  }

  function applyDisciplinePreview(payload) {
    if (!payload || !payload.id || !payload.discipline) return;
    var root = document.querySelector('[data-discipline-id="' + payload.id + '"]');
    if (!root) return;
    var d = payload.discipline;

    var nameEl = root.querySelector(".svc-name");
    if (nameEl && d.title) nameEl.innerHTML = titleWithEm(d.title);

    var metaEl = root.querySelector(".svc-meta");
    if (metaEl) metaEl.textContent = d.subtitle || d.budget_range || "";

    var kicker = root.querySelector(".svc-expand-kicker");
    if (kicker) kicker.textContent = d.subtitle || "";

    var titleEl = root.querySelector(".svc-expand-title");
    if (titleEl) titleEl.innerHTML = d.headline || titleWithEm(d.title);

    var descEl = root.querySelector(".svc-expand-desc");
    if (descEl) descEl.textContent = d.description || "";

    root.querySelectorAll(".svc-expand-specs .svc-spec").forEach(function (el) {
      el.remove();
    });
    var specs = root.querySelector(".svc-expand-specs");
    if (specs) {
      var html = "";
      if (d.budget_range) {
        html +=
          '<div class="svc-spec"><div class="ss-k">Budget Range</div><div class="ss-v">' +
          esc(d.budget_range) +
          "</div></div>";
      }
      if (d.timeline) {
        html +=
          '<div class="svc-spec"><div class="ss-k">Timeline</div><div class="ss-v">' +
          esc(d.timeline) +
          "</div></div>";
      }
      if (d.scope) {
        html +=
          '<div class="svc-spec"><div class="ss-k">Scope</div><div class="ss-v">' +
          esc(d.scope) +
          "</div></div>";
      }
      specs.innerHTML = html;
    }

    var features = root.querySelector(".svc-expand-features");
    if (features) {
      features.innerHTML = (d.tags || [])
        .map(function (t) {
          return "<span>" + esc(t) + "</span>";
        })
        .join("");
    }

    if (d.image_url) {
      var bg = root.querySelector(".svc-expand-media .ph");
      if (bg) {
        var url = assetUrl(d.image_url);
        bg.setAttribute("data-lazy-bg", url);
        bg.style.backgroundImage = "url(" + url + ")";
      }
    }

    if (d.title) {
      root.setAttribute("data-cms-edit-label", d.title);
      var badge = root.querySelector(".cms-edit-badge");
      if (badge) badge.textContent = d.title;
    }

    window.VINAYAK_CMS_DISCIPLINES = window.VINAYAK_CMS_DISCIPLINES || {};
    window.VINAYAK_CMS_DISCIPLINES[payload.id] = JSON.parse(JSON.stringify(d));
  }

  function applyProjectPreview(payload) {
    if (!payload || !payload.id || !payload.project) return;
    var root = document.querySelector('[data-project-id="' + payload.id + '"]');
    if (!root) return;
    var p = payload.project;

    var titleEl = root.querySelector(".hpanel-ttl");
    if (titleEl && p.title) titleEl.innerHTML = titleWithEm(p.title);

    var meta = root.querySelectorAll(".hpanel-meta div .b");
    if (meta[0]) meta[0].textContent = projectTypeLabel(p);
    if (meta[1]) meta[1].textContent = p.location || "—";
    if (meta[2]) meta[2].textContent = p.year || "—";

    var desc = root.querySelector(".hpanel-desc");
    if (desc) desc.textContent = p.description || "";

    var tags = root.querySelector(".hpanel-tags");
    if (tags) {
      tags.innerHTML = (p.material_tags || [])
        .map(function (t) {
          return "<span>" + esc(t) + "</span>";
        })
        .join("");
    }

    if (p.images && p.images.length) {
      var media = root.querySelector(".hpanel-media .ph");
      if (media) {
        var url = assetUrl(p.images[0]);
        media.setAttribute("data-lazy-bg", url);
        media.style.backgroundImage = "url(" + url + ")";
      }
    }

    if (p.title) {
      root.setAttribute("data-cms-edit-label", p.title);
      var badge = root.querySelector(".cms-edit-badge");
      if (badge) badge.textContent = p.title;
    }

    window.VINAYAK_CMS_PROJECTS = window.VINAYAK_CMS_PROJECTS || {};
    window.VINAYAK_CMS_PROJECTS[payload.id] = JSON.parse(JSON.stringify(p));
  }

  function applyPreviewUpdate(payload) {
    if (!payload || !payload.sectionKey) return;
    var root = document.querySelector('[data-cms-block="' + payload.sectionKey + '"]');
    if (!root) return;

    var fields = payload.fields || {};
    var images = payload.images || [];

    root.querySelectorAll("[data-cms-field]").forEach(function (el) {
      var key = el.getAttribute("data-cms-field");
      if (fields[key] == null) return;
      if (el.getAttribute("data-cms-html") === "true") {
        var nextHtml = fields[key];
        if (normalizeHtml(el.innerHTML) === normalizeHtml(nextHtml)) return;
        el.innerHTML = nextHtml;
      } else if (el.tagName === "A") {
        if (el.textContent !== String(fields[key])) {
          el.textContent = fields[key];
        }
        var prefix = el.getAttribute("data-cms-href-prefix") || "";
        if (prefix === "mailto:") {
          el.href = "mailto:" + String(fields[key]).trim();
        } else if (prefix === "tel:") {
          el.href = "tel:" + String(fields[key]).replace(/[^\d+]/g, "");
        } else if (prefix) {
          el.href = prefix + String(fields[key]);
        }
      } else {
        if (el.textContent === String(fields[key])) return;
        el.textContent = fields[key];
      }
    });

    images.forEach(function (img) {
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

    if (window.VINAYAK_CMS_BLOCKS && window.VINAYAK_CMS_BLOCKS[payload.sectionKey]) {
      window.VINAYAK_CMS_BLOCKS[payload.sectionKey].fields = JSON.parse(
        JSON.stringify(fields),
      );
      window.VINAYAK_CMS_BLOCKS[payload.sectionKey].images = JSON.parse(
        JSON.stringify(images),
      );
    }
  }

  function scrollToSection(sectionKey) {
    var block = document.querySelector('[data-cms-block="' + sectionKey + '"]');
    if (!block) return;
    block.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () {
      selectBlock(block);
    }, 350);
  }

  function scrollToDiscipline(id) {
    var el = document.querySelector('[data-discipline-id="' + id + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () {
      selectDiscipline(el);
    }, 350);
  }

  function scrollToProject(id) {
    var el = document.querySelector('[data-project-id="' + id + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () {
      selectProject(el);
    }, 350);
  }

  function refreshEntities(kind) {
    if (!window.VINAYAK_CMS_REFRESH) return;
    if (kind === "disciplines" && window.VINAYAK_CMS_REFRESH.disciplines) {
      window.VINAYAK_CMS_REFRESH.disciplines().then(announceCatalog);
      return;
    }
    if (kind === "projects" && window.VINAYAK_CMS_REFRESH.journey) {
      window.VINAYAK_CMS_REFRESH.journey().then(announceCatalog);
    }
  }

  function enableEditMode() {
    if (editMode) {
      announceCatalog();
      return;
    }
    editMode = true;
    injectStyles();
    ensureBanner();
    document.addEventListener("mouseover", onMouseOver, true);
    document.addEventListener("click", onClick, true);
    document.documentElement.classList.add("cms-edit-mode");
    announceCatalog();
    setTimeout(announceCatalog, 800);
    setTimeout(announceCatalog, 2000);
  }

  function onMessage(event) {
    var data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "CMS_EDIT_MODE_ON") {
      enableEditMode();
      return;
    }

    if (data.type === "CMS_PREVIEW_UPDATE") {
      applyPreviewUpdate(data);
      return;
    }

    if (data.type === "CMS_DISCIPLINE_PREVIEW_UPDATE") {
      applyDisciplinePreview(data);
      return;
    }

    if (data.type === "CMS_PROJECT_PREVIEW_UPDATE") {
      applyProjectPreview(data);
      return;
    }

    if (data.type === "CMS_BLOCK_SAVED" && data.sectionKey) {
      window.VINAYAK_CMS_BLOCKS = window.VINAYAK_CMS_BLOCKS || {};
      window.VINAYAK_CMS_BLOCKS[data.sectionKey] = {
        section_key: data.sectionKey,
        section_label: data.sectionLabel || data.sectionKey,
        fields: JSON.parse(JSON.stringify(data.fields || {})),
        images: JSON.parse(JSON.stringify(data.images || [])),
      };
      applyPreviewUpdate({
        sectionKey: data.sectionKey,
        fields: data.fields || {},
        images: data.images || [],
      });
      return;
    }

    if (data.type === "CMS_DISCIPLINE_SAVED" && data.id) {
      applyDisciplinePreview(data);
      refreshEntities("disciplines");
      return;
    }

    if (data.type === "CMS_PROJECT_SAVED" && data.id) {
      applyProjectPreview(data);
      refreshEntities("projects");
      return;
    }

    if (data.type === "CMS_SELECT_SECTION" && data.sectionKey) {
      enableEditMode();
      scrollToSection(data.sectionKey);
      return;
    }

    if (data.type === "CMS_SELECT_DISCIPLINE" && data.id) {
      enableEditMode();
      scrollToDiscipline(data.id);
      return;
    }

    if (data.type === "CMS_SELECT_PROJECT" && data.id) {
      enableEditMode();
      scrollToProject(data.id);
    }
  }

  if (inIframe()) {
    window.addEventListener("message", onMessage);
  }
})();
