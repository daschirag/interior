export const PAGE_OPTIONS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard.html" },
  { id: "projects", label: "Projects", path: "/Projects.html" },
  { id: "services", label: "Services", path: "/Services.html" },
  { id: "contact", label: "Contact", path: "/Contact.html" },
];

export const EDITOR_STEPS = [
  {
    title: "Choose a page",
    body: "Use the Page menu (top right) to open Dashboard, Projects, Services, or Contact.",
  },
  {
    title: "Pick what to edit",
    body: "Page sections, discipline rows (1 BHK, 2 BHK…), or project journey panels — from the list or by clicking blue outlines in the preview.",
  },
  {
    title: "Edit & preview",
    body: "Change text, budget (lacs), timeline, project title, city, year — the preview updates before you save.",
  },
  {
    title: "Save & check layout",
    body: "Click Save changes, then switch to Desktop or Mobile to verify the live layout.",
  },
];

export const PAGE_ENTITY_HINTS = {
  dashboard: [
    {
      label: "Featured project cards",
      path: "/projects",
      detail: "Quick-edit featured cards from Projects, or use Website Editor on Projects page.",
    },
  ],
  projects: [],
  services: [],
  contact: [
    {
      label: "Studio addresses & phones",
      path: "/site-settings",
      detail: "Location cards pull from Studio Locations in Site Settings (JSON).",
    },
  ],
};
