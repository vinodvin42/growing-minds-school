export type AdminTab =
  | "dashboard"
  | "settings"
  | "homepage"
  | "carousel"
  | "gallery"
  | "activities"
  | "videos"
  | "news"
  | "teachers"
  | "testimonials"
  | "about"
  | "students"
  | "homework"
  | "messages";

export type AdminNavItem = {
  id: AdminTab;
  label: string;
  icon: string;
  hint?: string;
};

export type AdminNavSection = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/** Top navigation — grouped by task area */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: "fa-th-large", hint: "Quick links to all areas" }],
  },
  {
    id: "site",
    label: "Website Setup",
    items: [
      { id: "settings", label: "Site Settings", icon: "fa-cog", hint: "Logo, contact, footer" },
      { id: "homepage", label: "Homepage", icon: "fa-home", hint: "Hero text & admissions banner" },
      { id: "about", label: "About Page", icon: "fa-info-circle", hint: "Vision, mission, values" },
    ],
  },
  {
    id: "media",
    label: "Media & Pages",
    items: [
      { id: "carousel", label: "Home Carousel", icon: "fa-images", hint: "Banner slides" },
      { id: "gallery", label: "Photo Gallery", icon: "fa-camera", hint: "Public gallery photos" },
      { id: "activities", label: "Activities Showcase", icon: "fa-palette", hint: "Student activity stories" },
      { id: "videos", label: "Video Library", icon: "fa-video", hint: "YouTube & tour videos" },
      { id: "news", label: "News & Events", icon: "fa-newspaper", hint: "Announcements" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "teachers", label: "Teachers", icon: "fa-chalkboard-teacher", hint: "Staff profiles" },
      { id: "testimonials", label: "Testimonials", icon: "fa-quote-left", hint: "Parent quotes" },
    ],
  },
  {
    id: "student-app",
    label: "Student App",
    items: [
      { id: "students", label: "Student Accounts", icon: "fa-user-graduate", hint: "Login IDs & passwords" },
      { id: "homework", label: "Homework", icon: "fa-book", hint: "Assignments & files" },
      { id: "messages", label: "Messages", icon: "fa-bullhorn", hint: "Broadcast & individual" },
    ],
  },
];

export const ALL_ADMIN_TABS: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((s) => s.items);

export function findAdminNavItem(tab: AdminTab): AdminNavItem | undefined {
  return ALL_ADMIN_TABS.find((t) => t.id === tab);
}

export function findAdminSection(tab: AdminTab): AdminNavSection | undefined {
  return ADMIN_NAV_SECTIONS.find((s) => s.items.some((i) => i.id === tab));
}

/** Tabs that use the main Save Changes button (site content JSON) */
export const WEBSITE_CONTENT_TABS: AdminTab[] = [
  "settings",
  "homepage",
  "carousel",
  "gallery",
  "activities",
  "videos",
  "news",
  "teachers",
  "testimonials",
  "about",
];

export function usesWebsiteContentSave(tab: AdminTab): boolean {
  return WEBSITE_CONTENT_TABS.includes(tab);
}
