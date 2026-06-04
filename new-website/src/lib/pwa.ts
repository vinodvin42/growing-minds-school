/** Shared PWA branding — used by manifest and layout metadata */
export const PWA = {
  name: "Growing Minds English School",
  shortName: "Growing Minds",
  description:
    "Growing Minds English School — Nursery to 8th Standard in Malad West, Mumbai. Admissions, activities, and student portal.",
  themeColor: "#2D6A4F",
  backgroundColor: "#ffffff",
  /** Installed app opens the student login (session restores dashboard automatically). */
  startUrl: "/student/login",
  scope: "/student/",
} as const;
