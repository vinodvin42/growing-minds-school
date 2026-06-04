/** Vercel Blob folder layout for student portal data. */

export const PORTAL_ROOT = "portal";

/** @deprecated Single-file storage — migrated on read/save */
export const LEGACY_PORTAL_BLOB_PATH = "student-portal-data.json";

/** @deprecated Single-file registry — migrated on read/save */
export const LEGACY_STUDENTS_BLOB_PATH = "students-registry.json";

export function academicYear(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return String(new Date().getFullYear());
  return String(d.getFullYear());
}

/** `2026/06` from ISO date — used for messages only */
export function yearMonthFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    return yearMonthFromDate(new Date());
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}/${month}`;
}

export function classSlug(standard: string): string {
  const slug = standard
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return slug || "unassigned";
}

/** Homework: portal/2026/classes/3rd-standard/homework.json */
export function classHomeworkBlobPath(year: string, slug: string): string {
  return `${PORTAL_ROOT}/${year}/classes/${slug}/homework.json`;
}

/** Messages: portal/2026/06/messages.json */
export function messagesBlobPath(yearMonth: string): string {
  return `${PORTAL_ROOT}/${yearMonth}/messages.json`;
}

export function classStudentsBlobPath(year: string, slug: string): string {
  return `${PORTAL_ROOT}/${year}/classes/${slug}/students.json`;
}

/** Fees: portal/2026/accounts/stu_abc123.json */
export function studentFeesBlobPath(year: string, studentId: string): string {
  return `${PORTAL_ROOT}/${year}/accounts/${studentId}.json`;
}

/** Holidays: portal/2026/calendar/holidays.json */
export function holidaysBlobPath(year: string): string {
  return `${PORTAL_ROOT}/${year}/calendar/holidays.json`;
}

/** Reminders: portal/2026/calendar/reminders.json */
export function remindersBlobPath(year: string): string {
  return `${PORTAL_ROOT}/${year}/calendar/reminders.json`;
}

export function parseClassHomeworkPath(pathname: string): { year: string; slug: string } | null {
  const match = pathname.match(new RegExp(`^${PORTAL_ROOT}/(\\d{4})/classes/([^/]+)/homework\\.json$`));
  if (!match) return null;
  return { year: match[1], slug: match[2] };
}

export function parseClassSlugFromStudentsPath(pathname: string): { year: string; slug: string } | null {
  const match = pathname.match(new RegExp(`^${PORTAL_ROOT}/(\\d{4})/classes/([^/]+)/students\\.json$`));
  if (!match) return null;
  return { year: match[1], slug: match[2] };
}
