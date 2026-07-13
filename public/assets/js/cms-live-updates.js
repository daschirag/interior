/**
 * Live CMS updates via Supabase Realtime (public site only).
 * Runs after hydrateContentBlocks() on initial load; handles INSERT/UPDATE/DELETE.
 * Requires: @supabase/supabase-js, morphdom, VINAYAK_CMS_READY, cms-supabase-config.js
 */
(function () {
  "use strict";

  var LOG = "[cms-live]";

  function cmsApi() {
    return window.VINAYAK_CMS_APPLY || {};
  }

  function currentPageSlug() {
    if (cmsApi().contentPageSlug) return cmsApi().contentPageSlug();
    var fromBody = document.body && document.body.getAttribute("data-cms-page");
    if (fromBody) return String(fromBody).toLowerCase();
    var file = (window.location.pathname || "").split("/").pop() || "index.html";
    if (file.toLowerCase() === "dashboard.html") return "dashboard";
    return file.replace(/\.html$/i, "").toLowerCase();
  }

  function afterMorph() {
    if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh(true);
  }

  function killScrollTriggersIn(el) {
    if (!el || !window.ScrollTrigger) return;
    window.ScrollTrigger.getAll().forEach(function (st) {
      if (st.trigger && (el === st.trigger || el.contains(st.trigger))) {
        st.kill();
      }
    });
  }

  function parseJsonField(value, fallback) {
    if (value == null) return fallback;
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function rowToContentBlock(row) {
    return {
      id: row.id,
      page: row.page,
      section_key: row.section_key,
      section_label: row.section_label,
      fields: parseJsonField(row.fields, {}),
      images: parseJsonField(row.images, []),
    };
  }

  function morphContentBlock(block) {
    if (!block || !block.section_key) return;
    if (block.page && block.page !== currentPageSlug()) return;

    var root = document.querySelector(
      '[data-cms-block="' + block.section_key + '"]',
    );
    if (!root) return;

    window.VINAYAK_CMS_BLOCKS = window.VINAYAK_CMS_BLOCKS || {};
    window.VINAYAK_CMS_BLOCKS[block.section_key] = {
      section_key: block.section_key,
      section_label: block.section_label,
      page: block.page,
      fields: JSON.parse(JSON.stringify(block.fields || {})),
      images: JSON.parse(JSON.stringify(block.images || [])),
    };

    var apply = cmsApi().applyContentBlock;
    if (!apply) return;

    if (!window.morphdom) {
      apply(block);
      afterMorph();
      return;
    }

    var template = root.cloneNode(true);
    apply(block, template);
    window.morphdom(root, template, {
      onBeforeElUpdated: function (fromEl, toEl) {
        if (fromEl.isEqualNode && fromEl.isEqualNode(toEl)) return false;
        return true;
      },
    });
    afterMorph();
    console.info(LOG, "morphed content block:", block.section_key);
  }

  function buildFeaturedCardHtml(project, index) {
    var api = cmsApi();
    var esc = api.esc || function (s) { return String(s == null ? "" : s); };
    var assetUrl = api.assetUrl || function (u) { return u || ""; };
    var projectCover = api.projectCover || function () { return ""; };
    var projectTypeLabel = api.projectTypeLabel || function () { return "Interior"; };
    var padNo = api.padNo || function (n) { return String(n); };

    var cover = projectCover(project);
    var loc = project.location || "";
    var typeLabel = project.project_type || projectTypeLabel(project);
    var sub = typeLabel + (loc ? " · " + loc : "");

    return (
      '<a class="proj-card" href="Projects.html" data-reveal data-project-id="' +
      esc(String(project.id)) +
      '">' +
      '<div class="pf ticks"><div class="ph lazy-bg" data-lazy-bg="' +
      esc(cover) +
      '" style="background-size:cover;background-position:center;">' +
      '<span class="ph-tag"><span class="a">◐ PROJECT</span><span class="b">' +
      esc(project.title) +
      "</span></span></div></div>" +
      '<div class="pmeta"><span class="pt">' +
      esc(project.title) +
      '</span><span class="pn">' +
      padNo(index + 1) +
      "</span></div>" +
      '<div class="pl">' +
      esc(sub) +
      "</div></a>"
    );
  }

  function featuredRow() {
    return document.querySelector("[data-cms-featured]");
  }

  function upsertFeaturedProject(project) {
    if (!project || !project.is_featured || project.is_active === false) {
      removeFeaturedProject(project && project.id);
      return;
    }

    var row = featuredRow();
    if (!row) return;

    var esc = cmsApi().esc || function (s) { return String(s == null ? "" : s); };
    var id = String(project.id);
    var existing = row.querySelector('[data-project-id="' + esc(id) + '"]');
    var cards = row.querySelectorAll("[data-project-id]");
    var index = existing
      ? Array.prototype.indexOf.call(row.children, existing)
      : Math.min(cards.length, 2);

    var wrap = document.createElement("div");
    wrap.innerHTML = buildFeaturedCardHtml(project, index);
    var nextCard = wrap.firstElementChild;
    if (!nextCard) return;

    if (existing && window.morphdom) {
      window.morphdom(existing, nextCard);
      if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
    } else if (existing) {
      existing.replaceWith(nextCard);
    } else {
      row.appendChild(nextCard);
      if (window.AURUM && AURUM.refreshReveals) AURUM.refreshReveals(nextCard);
      if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
    }

    trimFeaturedRow(row);
    afterMorph();
    console.info(LOG, "featured project updated:", project.id);
  }

  function trimFeaturedRow(row) {
    var cards = row.querySelectorAll("[data-project-id]");
    for (var i = 3; i < cards.length; i++) {
      killScrollTriggersIn(cards[i]);
      cards[i].remove();
    }
  }

  function removeFeaturedProject(projectId) {
    if (projectId == null) return;
    var row = featuredRow();
    if (!row) return;
    var esc = cmsApi().esc || function (s) { return String(s == null ? "" : s); };
    var card = row.querySelector('[data-project-id="' + esc(String(projectId)) + '"]');
    if (!card) return;
    killScrollTriggersIn(card);
    card.remove();
    afterMorph();
    console.info(LOG, "featured project removed:", projectId);
  }

  function journeyTrack() {
    return document.querySelector("[data-cms-journey]");
  }

  function countJourneyPanels(track) {
    return track.querySelectorAll(".hpanel[data-project-id]").length;
  }

  function upsertJourneyProject(project) {
    var track = journeyTrack();
    if (!track || !project) return;

    var api = cmsApi();
    var esc = api.esc || function (s) { return String(s == null ? "" : s); };
    var build = api.buildJourneyPanelHtml;
    if (!build) return;

    var id = String(project.id);
    var existing = track.querySelector('.hpanel[data-project-id="' + esc(id) + '"]');
    var total = countJourneyPanels(track);
    var index = existing
      ? Array.prototype.indexOf.call(
          track.querySelectorAll(".hpanel[data-project-id]"),
          existing,
        )
      : total;

    window.VINAYAK_CMS_PROJECTS = window.VINAYAK_CMS_PROJECTS || {};
    window.VINAYAK_CMS_PROJECTS[project.id] = project;

    var wrap = document.createElement("div");
    wrap.innerHTML = build(project, index, existing ? total : total + 1);
    var nextPanel = wrap.firstElementChild;
    if (!nextPanel) return;

    if (existing && window.morphdom) {
      window.morphdom(existing, nextPanel);
    } else if (existing) {
      existing.replaceWith(nextPanel);
    } else {
      track.appendChild(nextPanel);
      if (window.AURUM && AURUM.refreshReveals) AURUM.refreshReveals(nextPanel);
    }

    if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
    afterMorph();
    console.info(LOG, "journey project updated:", project.id);
  }

  function removeJourneyProject(projectId) {
    var track = journeyTrack();
    if (!track || projectId == null) return;
    var esc = cmsApi().esc || function (s) { return String(s == null ? "" : s); };
    var panel = track.querySelector('.hpanel[data-project-id="' + esc(String(projectId)) + '"]');
    if (!panel) return;
    killScrollTriggersIn(panel);
    panel.remove();
    afterMorph();
    console.info(LOG, "journey project removed:", projectId);
  }

  function handleProjectChange(payload) {
    var eventType = payload.eventType;
    var row = payload.new || payload.old;
    if (!row) return;

    if (eventType === "DELETE" || row.is_active === false) {
      removeFeaturedProject(row.id);
      removeJourneyProject(row.id);
      return;
    }

    if (eventType === "INSERT" || eventType === "UPDATE") {
      upsertFeaturedProject(row);
      upsertJourneyProject(row);
    }
  }

  function handleContentBlockChange(payload) {
    var eventType = payload.eventType;
    if (eventType === "DELETE") {
      var oldRow = payload.old;
      if (!oldRow || oldRow.page !== currentPageSlug()) return;
      var root = document.querySelector(
        '[data-cms-block="' + oldRow.section_key + '"]',
      );
      if (root) {
        killScrollTriggersIn(root);
        console.info(LOG, "content block deleted in DB (DOM kept):", oldRow.section_key);
      }
      return;
    }

    var block = rowToContentBlock(payload.new || {});
    if (!block.section_key) return;

    if (eventType === "INSERT") {
      if (block.page !== currentPageSlug()) return;
      if (document.querySelector('[data-cms-block="' + block.section_key + '"]')) {
        morphContentBlock(block);
      }
      return;
    }

    if (eventType === "UPDATE") {
      morphContentBlock(block);
    }
  }

  function handleDisciplineChange(payload) {
    var list = document.querySelector("[data-cms-disciplines]");
    if (!list) return;

    var eventType = payload.eventType;
    var row = payload.new || payload.old;
    if (!row) return;

    var api = cmsApi();
    var esc = api.esc || function (s) { return String(s == null ? "" : s); };
    var build = api.buildDisciplineItemHtml;
    var wire = api.wireDisciplineAccordion;

    if (eventType === "DELETE" || row.is_active === false) {
      var oldItem = list.querySelector(
        '[data-discipline-id="' + esc(String(row.id)) + '"]',
      );
      if (oldItem) {
        killScrollTriggersIn(oldItem);
        oldItem.remove();
        afterMorph();
        console.info(LOG, "discipline removed:", row.id);
      }
      return;
    }

    if (!build) return;

    var discipline = Object.assign({}, row);
    if (typeof discipline.images === "string") {
      discipline.images = parseJsonField(
        discipline.images,
        discipline.image_url ? [discipline.image_url] : []
      );
    } else if (!Array.isArray(discipline.images) || !discipline.images.length) {
      discipline.images = discipline.image_url ? [discipline.image_url] : [];
    }

    window.VINAYAK_CMS_DISCIPLINES = window.VINAYAK_CMS_DISCIPLINES || {};
    window.VINAYAK_CMS_DISCIPLINES[discipline.id] = discipline;

    var existing = list.querySelector(
      '[data-discipline-id="' + esc(String(discipline.id)) + '"]',
    );
    var items = list.querySelectorAll("[data-discipline-id]");
    var index = existing
      ? Array.prototype.indexOf.call(items, existing)
      : items.length;

    var wrap = document.createElement("div");
    wrap.innerHTML = build(discipline, index);
    var nextItem = wrap.firstElementChild;
    if (!nextItem) return;

    if (existing && window.morphdom) {
      window.morphdom(existing, nextItem);
    } else if (existing) {
      existing.replaceWith(nextItem);
    } else {
      list.appendChild(nextItem);
      if (window.AURUM && AURUM.refreshReveals) AURUM.refreshReveals(nextItem);
    }

    if (wire) wire();
    if (window.VINAYAK_SVC_GALLERY && window.VINAYAK_SVC_GALLERY.wireAll) {
      window.VINAYAK_SVC_GALLERY.wireAll(list);
    }
    if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
    afterMorph();
    console.info(LOG, "discipline updated:", discipline.id);
  }

  function studiosGrid() {
    return document.querySelector("[data-cms-studios]");
  }

  function updateStudiosHeading(count) {
    var heading = document.querySelector("[data-cms-studios-count]");
    if (!heading) return;
    heading.innerHTML =
      "<span>" +
      count +
      " cit" +
      (count === 1 ? "y" : "ies") +
      ', <em>one</em> standard.</span>';
  }

  function handleStudioChange(payload) {
    var grid = studiosGrid();
    if (!grid) return;

    var eventType = payload.eventType;
    var row = payload.new || payload.old;
    if (!row) return;

    var api = cmsApi();
    var esc = api.esc || function (s) { return String(s == null ? "" : s); };
    var renderStudio = api.renderStudio;

    if (eventType === "DELETE" || row.is_active === false) {
      var oldCard = grid.querySelector(
        '[data-studio-id="' + esc(String(row.id)) + '"]',
      );
      if (oldCard) {
        killScrollTriggersIn(oldCard);
        oldCard.remove();
        updateStudiosHeading(grid.querySelectorAll("[data-studio-id]").length);
        afterMorph();
        console.info(LOG, "studio removed:", row.id);
      }
      return;
    }

    if (!renderStudio) return;

    var existing = grid.querySelector(
      '[data-studio-id="' + esc(String(row.id)) + '"]',
    );
    var cards = grid.querySelectorAll("[data-studio-id]");
    var index = existing
      ? Array.prototype.indexOf.call(cards, existing)
      : cards.length;

    var wrap = document.createElement("div");
    wrap.innerHTML = renderStudio(row, index);
    var nextCard = wrap.firstElementChild;
    if (!nextCard) return;

    if (existing && window.morphdom) {
      window.morphdom(existing, nextCard);
    } else if (existing) {
      existing.replaceWith(nextCard);
    } else {
      grid.appendChild(nextCard);
      if (window.AURUM && AURUM.refreshReveals) AURUM.refreshReveals(nextCard);
    }

    updateStudiosHeading(grid.querySelectorAll("[data-studio-id]").length);
    if (window.AURUM && AURUM.refreshLazyMedia) AURUM.refreshLazyMedia();
    afterMorph();
    console.info(LOG, "studio updated:", row.id);
  }

  function startRealtime() {
    var cfg = window.VINAYAK_SUPABASE || {};
    if (!cfg.url || !cfg.anonKey) {
      console.info(LOG, "Supabase not configured — set VINAYAK_SUPABASE in cms-supabase-config.js");
      return;
    }
    if (!window.supabase || !window.supabase.createClient) {
      console.warn(LOG, "@supabase/supabase-js not loaded");
      return;
    }

    var client = window.supabase.createClient(cfg.url, cfg.anonKey, {
      realtime: { params: { eventsPerSecond: 4 } },
    });

    var channel = client
      .channel("vinayak-cms-live-" + currentPageSlug())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content_blocks" },
        function (payload) {
          try {
            handleContentBlockChange(payload);
          } catch (err) {
            console.error(LOG, "content_blocks handler error", err);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        function (payload) {
          try {
            handleProjectChange(payload);
          } catch (err) {
            console.error(LOG, "projects handler error", err);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "disciplines" },
        function (payload) {
          try {
            handleDisciplineChange(payload);
          } catch (err) {
            console.error(LOG, "disciplines handler error", err);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "studios" },
        function (payload) {
          try {
            handleStudioChange(payload);
          } catch (err) {
            console.error(LOG, "studios handler error", err);
          }
        },
      )
      .subscribe(function (status, err) {
        if (status === "SUBSCRIBED") {
          console.info(LOG, "subscribed on page:", currentPageSlug());
        } else if (err) {
          console.error(LOG, "subscribe error", err);
        } else if (status === "CHANNEL_ERROR") {
          console.error(LOG, "channel error — check Phase 1 SQL and anon RLS policies");
        }
      });

    window.VINAYAK_CMS_LIVE = { client: client, channel: channel };
  }

  function boot() {
    if (document.documentElement.classList.contains("cms-edit-mode")) return;
    startRealtime();
  }

  if (window.VINAYAK_CMS_READY && typeof window.VINAYAK_CMS_READY.then === "function") {
    window.VINAYAK_CMS_READY.then(boot).catch(boot);
  } else {
    boot();
  }
})();
