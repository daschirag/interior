import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ContentBlockEditorPanel from "../components/ContentBlockEditorPanel";
import DisciplineEditorPanel from "../components/DisciplineEditorPanel";
import ProjectEditorPanel from "../components/ProjectEditorPanel";
import EditorToast from "../components/EditorToast";
import api from "../services/api";
import {
  EDITOR_STEPS,
  PAGE_ENTITY_HINTS,
  PAGE_OPTIONS,
} from "../config/websiteEditorConfig";
import "../styles/websiteEditor.css";

const PUBLIC_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000";

const VIEW_MODES = [
  { id: "split", label: "Edit" },
  { id: "desktop", label: "Desktop" },
  { id: "mobile", label: "Mobile" },
];

const GUIDE_STORAGE_KEY = "vinayak_website_editor_guide_dismissed";

function selectionLabel(selection) {
  if (!selection) return "";
  if (selection.kind === "block") return selection.sectionLabel;
  return selection.title || "Item";
}

function isSameSelection(a, b) {
  if (!a || !b) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === "block") return a.sectionKey === b.sectionKey;
  return String(a.id) === String(b.id);
}

function WebsiteEditor() {
  const iframeRef = useRef(null);
  const [pageId, setPageId] = useState("dashboard");
  const [viewMode, setViewMode] = useState("split");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [selection, setSelection] = useState(null);
  const [pageBlocks, setPageBlocks] = useState([]);
  const [pageDisciplines, setPageDisciplines] = useState([]);
  const [pageProjects, setPageProjects] = useState([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [guideOpen, setGuideOpen] = useState(
    () => localStorage.getItem(GUIDE_STORAGE_KEY) !== "1",
  );
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const [toast, setToast] = useState("");

  const iframeSrc = useMemo(() => {
    const page = PAGE_OPTIONS.find((p) => p.id === pageId) || PAGE_OPTIONS[0];
    return `${PUBLIC_SITE_URL.replace(/\/$/, "")}${page.path}`;
  }, [pageId]);

  const postToIframe = useCallback((message) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(message, "*");
  }, []);

  const enableEditMode = useCallback(() => {
    postToIframe({ type: "CMS_EDIT_MODE_ON" });
  }, [postToIframe]);

  const handlePreview = useCallback(
    (payload) => {
      postToIframe({
        type: "CMS_PREVIEW_UPDATE",
        sectionKey: payload.sectionKey,
        fields: payload.fields,
        images: payload.images,
      });
    },
    [postToIframe],
  );

  const confirmUnsaved = useCallback(() => {
    if (!editorDirty) return true;
    return window.confirm(
      "You have unsaved changes. Leave this section without saving?",
    );
  }, [editorDirty]);

  const handleSaved = useCallback(
    (payload) => {
      postToIframe({
        type: "CMS_BLOCK_SAVED",
        sectionKey: payload.sectionKey,
        sectionLabel: payload.sectionLabel,
        fields: payload.fields,
        images: payload.images,
      });
      setSelection((prev) => {
        if (
          !prev ||
          prev.kind !== "block" ||
          prev.sectionKey !== payload.sectionKey
        ) {
          return prev;
        }
        return {
          ...prev,
          sectionLabel: payload.sectionLabel || prev.sectionLabel,
          fields: payload.fields || {},
          images: payload.images || [],
        };
      });
      if (!payload.silent) {
        setToast("Saved — live for all visitors");
      }
      setEditorDirty(false);
    },
    [postToIframe],
  );

  const loadPageCatalog = useCallback(async () => {
    setBlocksLoading(true);
    try {
      const blockRes = await api.get(`/content-blocks?page=${pageId}`);
      setPageBlocks(blockRes.data?.success ? blockRes.data.blocks || [] : []);

      if (pageId === "services") {
        const dRes = await api.get("/disciplines");
        setPageDisciplines(dRes.data?.success ? dRes.data.disciplines || [] : []);
      } else {
        setPageDisciplines([]);
      }

      if (pageId === "projects") {
        const pRes = await api.get("/projects");
        setPageProjects(pRes.data?.success ? pRes.data.projects || [] : []);
      } else {
        setPageProjects([]);
      }
    } catch (error) {
      console.error(error);
      setPageBlocks([]);
      setPageDisciplines([]);
      setPageProjects([]);
    } finally {
      setBlocksLoading(false);
    }
  }, [pageId]);

  const handleDisciplinePreview = useCallback(
    (payload) => {
      postToIframe({
        type: "CMS_DISCIPLINE_PREVIEW_UPDATE",
        id: payload.id,
        discipline: payload.discipline,
      });
    },
    [postToIframe],
  );

  const handleProjectPreview = useCallback(
    (payload) => {
      postToIframe({
        type: "CMS_PROJECT_PREVIEW_UPDATE",
        id: payload.id,
        project: payload.project,
      });
    },
    [postToIframe],
  );

  const handleDisciplineSaved = useCallback(
    (payload) => {
      postToIframe({
        type: "CMS_DISCIPLINE_SAVED",
        id: payload.id,
        discipline: payload.discipline,
      });
      setSelection((prev) => {
        if (
          !prev ||
          prev.kind !== "discipline" ||
          String(prev.id) !== String(payload.id)
        ) {
          return prev;
        }
        return {
          ...prev,
          title: payload.discipline?.title || prev.title,
        };
      });
      if (!payload.silent) {
        setToast("Saved — discipline updated on Services page");
      }
      setEditorDirty(false);
      loadPageCatalog();
    },
    [postToIframe, loadPageCatalog],
  );

  const handleProjectSaved = useCallback(
    (payload) => {
      postToIframe({
        type: "CMS_PROJECT_SAVED",
        id: payload.id,
        project: payload.project,
      });
      setSelection((prev) => {
        if (
          !prev ||
          prev.kind !== "project" ||
          String(prev.id) !== String(payload.id)
        ) {
          return prev;
        }
        return {
          ...prev,
          title: payload.project?.title || prev.title,
        };
      });
      if (!payload.silent) {
        setToast("Saved — project updated on Projects page");
      }
      setEditorDirty(false);
      loadPageCatalog();
    },
    [postToIframe, loadPageCatalog],
  );

  const openSection = useCallback(
    async (block, scrollPreview = true) => {
      if (!block?.section_key) return;
      if (
        selection?.kind === "block" &&
        selection.sectionKey === block.section_key
      ) {
        return;
      }
      if (!confirmUnsaved()) return;

      if (scrollPreview) {
        postToIframe({
          type: "CMS_SELECT_SECTION",
          sectionKey: block.section_key,
        });
      }

      try {
        const res = await api.get(`/content-blocks/${block.section_key}`);
        if (!res.data?.success) return;
        const saved = res.data.block;
        setSelection({
          kind: "block",
          sectionKey: saved.section_key,
          sectionLabel: saved.section_label || block.section_label,
          fields: saved.fields || {},
          images: saved.images || [],
        });
        setSectionsCollapsed(true);
        setGuideOpen(false);
        if (viewMode !== "split") setViewMode("split");
      } catch (error) {
        console.error(error);
      }
    },
    [postToIframe, viewMode, selection, confirmUnsaved],
  );

  const openDiscipline = useCallback(
    (discipline, scrollPreview = true) => {
      if (!discipline?.id) return;
      if (
        selection?.kind === "discipline" &&
        String(selection.id) === String(discipline.id)
      ) {
        return;
      }
      if (!confirmUnsaved()) return;

      if (scrollPreview) {
        postToIframe({ type: "CMS_SELECT_DISCIPLINE", id: discipline.id });
      }

      setSelection({
        kind: "discipline",
        id: discipline.id,
        title: discipline.title,
      });
      setSectionsCollapsed(true);
      setGuideOpen(false);
      if (viewMode !== "split") setViewMode("split");
    },
    [confirmUnsaved, postToIframe, selection, viewMode],
  );

  const openProject = useCallback(
    (project, scrollPreview = true) => {
      if (!project?.id) return;
      if (
        selection?.kind === "project" &&
        String(selection.id) === String(project.id)
      ) {
        return;
      }
      if (!confirmUnsaved()) return;

      if (scrollPreview) {
        postToIframe({ type: "CMS_SELECT_PROJECT", id: project.id });
      }

      setSelection({
        kind: "project",
        id: project.id,
        title: project.title,
      });
      setSectionsCollapsed(true);
      setGuideOpen(false);
      if (viewMode !== "split") setViewMode("split");
    },
    [confirmUnsaved, postToIframe, selection, viewMode],
  );

  const applyIncomingSelection = useCallback(
    (next, revertMessage) => {
      if (editorDirty && selection && !isSameSelection(selection, next)) {
        if (!window.confirm(revertMessage)) {
          if (selection.kind === "block") {
            postToIframe({
              type: "CMS_SELECT_SECTION",
              sectionKey: selection.sectionKey,
            });
          } else if (selection.kind === "discipline") {
            postToIframe({ type: "CMS_SELECT_DISCIPLINE", id: selection.id });
          } else if (selection.kind === "project") {
            postToIframe({ type: "CMS_SELECT_PROJECT", id: selection.id });
          }
          return false;
        }
      }
      setSelection(next);
      setSectionsCollapsed(true);
      setGuideOpen(false);
      setEditorDirty(false);
      if (viewMode !== "split") setViewMode("split");
      return true;
    },
    [editorDirty, selection, postToIframe, viewMode],
  );

  useEffect(() => {
    function onMessage(event) {
      if (event.data?.type === "CMS_SECTION_CLICKED") {
        applyIncomingSelection(
          {
            kind: "block",
            sectionKey: event.data.sectionKey,
            sectionLabel: event.data.sectionLabel || event.data.sectionKey,
            fields: event.data.fields || {},
            images: event.data.images || [],
          },
          "You have unsaved changes. Switch section without saving?",
        );
        return;
      }

      if (event.data?.type === "CMS_DISCIPLINE_CLICKED") {
        applyIncomingSelection(
          {
            kind: "discipline",
            id: event.data.id,
            title: event.data.title,
          },
          "You have unsaved changes. Switch discipline without saving?",
        );
        return;
      }

      if (event.data?.type === "CMS_PROJECT_CLICKED") {
        applyIncomingSelection(
          {
            kind: "project",
            id: event.data.id,
            title: event.data.title,
          },
          "You have unsaved changes. Switch project without saving?",
        );
        return;
      }

      if (event.data?.type === "CMS_EDITOR_CATALOG_READY") {
        if (event.data.sections?.length) {
          setPageBlocks((prev) =>
            prev.length
              ? prev
              : event.data.sections.map((section) => ({
                  section_key: section.sectionKey,
                  section_label: section.sectionLabel,
                })),
          );
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [applyIncomingSelection]);

  useEffect(() => {
    setIframeLoaded(false);
    setSelection(null);
    setSectionsCollapsed(false);
    setEditorDirty(false);
    loadPageCatalog();
  }, [iframeSrc, loadPageCatalog]);

  useEffect(() => {
    if (!iframeLoaded) return;
    enableEditMode();
    const timer = setTimeout(enableEditMode, 600);
    const timer2 = setTimeout(enableEditMode, 1500);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [iframeLoaded, enableEditMode, iframeSrc]);

  const dismissGuide = () => {
    setGuideOpen(false);
    localStorage.setItem(GUIDE_STORAGE_KEY, "1");
  };

  const handlePageChange = (nextPageId) => {
    if (nextPageId === pageId) return;
    if (!confirmUnsaved()) return;
    setPageId(nextPageId);
  };

  const entityHints = PAGE_ENTITY_HINTS[pageId] || [];
  const isFullscreen = viewMode === "desktop" || viewMode === "mobile";

  return (
    <AdminLayout>
      <div
        className={`website-editor website-editor--${viewMode} ${
          isFullscreen ? "website-editor--fullscreen" : ""
        }`}
      >
        <header className="we-toolbar">
          <div className="we-toolbar__left">
            <div>
              <h1>Website Editor</h1>
              <p>
                Pick a section from the list, edit content, save, then preview on
                Desktop or Mobile.
              </p>
            </div>
          </div>

          <div className="we-toolbar__center">
            <div className="we-view-switch" role="tablist" aria-label="Preview mode">
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={viewMode === mode.id}
                  className={viewMode === mode.id ? "active" : ""}
                  onClick={() => setViewMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="we-toolbar__right">
            <label className="we-page-select">
              <span>Page</span>
              <select value={pageId} onChange={(e) => handlePageChange(e.target.value)}>
                {PAGE_OPTIONS.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <div
          className={`we-workspace ${
            viewMode === "split" ? "" : `we-workspace--${viewMode}`
          }`}
        >
          <div className="we-preview-stage">
            {viewMode === "mobile" && (
              <div className="we-device-chrome">
                <div className="we-device-notch" />
              </div>
            )}

            <div
              className={`we-frame-shell ${
                viewMode === "mobile" ? "we-frame-shell--mobile" : ""
              } ${viewMode === "desktop" ? "we-frame-shell--desktop" : ""}`}
            >
              {!iframeLoaded && (
                <div className="we-frame-loading">
                  <span className="we-spinner" />
                  Loading live preview…
                </div>
              )}
              <iframe
                ref={iframeRef}
                title="Website preview"
                src={iframeSrc}
                className="we-frame"
                onLoad={() => setIframeLoaded(true)}
              />
            </div>

            {viewMode !== "split" && (
              <p className="we-preview-hint">
                {viewMode === "mobile"
                  ? "Mobile preview at 390px. Switch to Edit to change content."
                  : "Desktop fullscreen preview. Switch to Edit to change content."}
              </p>
            )}
          </div>

          {viewMode === "split" && (
            <aside
              className={`we-side ${selection ? "we-side--editing" : ""}`}
            >
              <div className="we-side-top">
                {guideOpen && !selection && (
                  <div className="we-guide">
                    <div className="we-guide__head">
                      <strong>How to edit</strong>
                      <button
                        type="button"
                        onClick={dismissGuide}
                        aria-label="Dismiss guide"
                      >
                        ×
                      </button>
                    </div>
                    <ol className="we-guide__steps">
                      {EDITOR_STEPS.map((step, index) => (
                        <li key={step.title}>
                          <span className="we-guide__n">{index + 1}</span>
                          <div>
                            <strong>{step.title}</strong>
                            <p>{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div
                  className={`we-section-nav ${
                    sectionsCollapsed ? "we-section-nav--collapsed" : ""
                  }`}
                >
                  <div className="we-section-nav__head">
                    <h2>
                      {selection && sectionsCollapsed
                        ? "Current item"
                        : "Editable on this page"}
                    </h2>
                    {selection && sectionsCollapsed ? (
                      <button
                        type="button"
                        className="we-link-btn"
                        onClick={() => setSectionsCollapsed(false)}
                      >
                        Show all
                      </button>
                    ) : (
                      !guideOpen &&
                      !selection && (
                        <button
                          type="button"
                          className="we-link-btn"
                          onClick={() => setGuideOpen(true)}
                        >
                          Show guide
                        </button>
                      )
                    )}
                  </div>

                  {selection && sectionsCollapsed ? (
                    <button
                      type="button"
                      className="we-section-current"
                      onClick={() => setSectionsCollapsed(false)}
                    >
                      <span className="we-section-list__label">
                        {selectionLabel(selection)}
                      </span>
                      <span className="we-section-current__change">Change</span>
                    </button>
                  ) : blocksLoading ? (
                    <p className="we-muted we-section-nav__empty">
                      Loading items…
                    </p>
                  ) : (
                    <>
                      {pageBlocks.length > 0 && (
                        <>
                          <p className="we-section-group-label">Page sections</p>
                          <ul className="we-section-list">
                            {pageBlocks.map((block, index) => (
                              <li key={block.section_key}>
                                <button
                                  type="button"
                                  className={
                                    selection?.kind === "block" &&
                                    selection.sectionKey === block.section_key
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() => openSection(block)}
                                >
                                  <span className="we-section-list__n">{index + 1}</span>
                                  <span className="we-section-list__label">
                                    {block.section_label || block.section_key}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {pageDisciplines.length > 0 && (
                        <>
                          <p className="we-section-group-label">Disciplines</p>
                          <ul className="we-section-list">
                            {pageDisciplines.map((discipline, index) => (
                              <li key={discipline.id}>
                                <button
                                  type="button"
                                  className={
                                    selection?.kind === "discipline" &&
                                    String(selection.id) === String(discipline.id)
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() => openDiscipline(discipline)}
                                >
                                  <span className="we-section-list__n">
                                    {index + 1}
                                  </span>
                                  <span className="we-section-list__label">
                                    {discipline.title}
                                    {discipline.budget_range
                                      ? ` · ${discipline.budget_range}`
                                      : ""}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {pageProjects.length > 0 && (
                        <>
                          <p className="we-section-group-label">Project journey</p>
                          <ul className="we-section-list">
                            {pageProjects.map((project, index) => (
                              <li key={project.id}>
                                <button
                                  type="button"
                                  className={
                                    selection?.kind === "project" &&
                                    String(selection.id) === String(project.id)
                                      ? "active"
                                      : ""
                                  }
                                  onClick={() => openProject(project)}
                                >
                                  <span className="we-section-list__n">
                                    {index + 1}
                                  </span>
                                  <span className="we-section-list__label">
                                    {project.title}
                                    {project.location ? ` · ${project.location}` : ""}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {pageBlocks.length === 0 &&
                        pageDisciplines.length === 0 &&
                        pageProjects.length === 0 && (
                          <p className="we-muted we-section-nav__empty">
                            No editable items on this page yet.
                          </p>
                        )}
                    </>
                  )}

                  {!selection && (
                    <p className="we-section-nav__tip">
                      Tip: click any blue outline in the preview — sections,
                      discipline rows (1 BHK, 2 BHK…), or project panels.
                    </p>
                  )}
                </div>

                {entityHints.length > 0 && !selection && (
                  <div className="we-entity-hints">
                    <h3>Also managed elsewhere</h3>
                    {entityHints.map((hint) => (
                      <div key={hint.path} className="we-entity-hint">
                        <Link to={hint.path}>{hint.label} →</Link>
                        <p>{hint.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="we-side-editor">
                {selection?.kind === "block" ? (
                  <ContentBlockEditorPanel
                    key={selection.sectionKey}
                    sectionKey={selection.sectionKey}
                    sectionLabel={selection.sectionLabel}
                    initialFields={selection.fields}
                    initialImages={selection.images}
                    onPreview={handlePreview}
                    onDirtyChange={setEditorDirty}
                    onSaved={handleSaved}
                    onClose={() => {
                      if (!confirmUnsaved()) return;
                      setSelection(null);
                      setSectionsCollapsed(false);
                      setEditorDirty(false);
                    }}
                  />
                ) : selection?.kind === "discipline" ? (
                  <DisciplineEditorPanel
                    key={`d-${selection.id}`}
                    disciplineId={selection.id}
                    disciplineTitle={selection.title}
                    onPreview={handleDisciplinePreview}
                    onDirtyChange={setEditorDirty}
                    onSaved={handleDisciplineSaved}
                    onClose={() => {
                      if (!confirmUnsaved()) return;
                      setSelection(null);
                      setSectionsCollapsed(false);
                      setEditorDirty(false);
                    }}
                  />
                ) : selection?.kind === "project" ? (
                  <ProjectEditorPanel
                    key={`p-${selection.id}`}
                    projectId={selection.id}
                    projectTitle={selection.title}
                    onPreview={handleProjectPreview}
                    onDirtyChange={setEditorDirty}
                    onSaved={handleProjectSaved}
                    onClose={() => {
                      if (!confirmUnsaved()) return;
                      setSelection(null);
                      setSectionsCollapsed(false);
                      setEditorDirty(false);
                    }}
                  />
                ) : (
                  <div className="we-side-prompt">
                    <p>
                      Select a page section, discipline (1 BHK, 2 BHK…), or
                      project panel to start editing.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>

        <EditorToast message={toast} onDone={() => setToast("")} />
      </div>
    </AdminLayout>
  );
}

export default WebsiteEditor;
