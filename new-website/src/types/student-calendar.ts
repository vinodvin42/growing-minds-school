import type { PortalAudience } from "@/types/student-portal";
import type { StudentProfile } from "@/types/student";
import { matchesStudentAudience } from "@/types/student-portal";

export type HolidayType = "holiday" | "half_day" | "ptm" | "event";

export type ReminderKind = "fees" | "homework" | "ptm" | "general";

export interface HolidayItem {
  id: string;
  title: string;
  description?: string;
  type: HolidayType;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD — optional for multi-day breaks */
  endDate?: string;
  active: boolean;
  /** When admin added this holiday */
  createdAt?: string;
}

export interface PortalReminder {
  id: string;
  kind: ReminderKind;
  title: string;
  body: string;
  /** YYYY-MM-DD — when the event is due or happens */
  eventDate: string;
  audience: PortalAudience;
  standard?: string;
  section?: string;
  targetStudentIds?: string[];
  active: boolean;
  createdAt: string;
}

export interface StudentCalendarData {
  holidays: HolidayItem[];
  reminders: PortalReminder[];
}

export const HOLIDAY_TYPES: { value: HolidayType; label: string }[] = [
  { value: "holiday", label: "Holiday" },
  { value: "half_day", label: "Half day" },
  { value: "ptm", label: "PTM / Meeting" },
  { value: "event", label: "School event" },
];

export const REMINDER_KINDS: { value: ReminderKind; label: string; icon: string }[] = [
  { value: "fees", label: "Fees", icon: "fa-wallet" },
  { value: "homework", label: "Homework", icon: "fa-book" },
  { value: "ptm", label: "PTM", icon: "fa-users" },
  { value: "general", label: "General", icon: "fa-bell" },
];

export function calendarUid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function formatCalendarDate(iso: string): string {
  if (!ISO_DATE.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCalendarDateRange(item: HolidayItem): string {
  if (!item.endDate || item.endDate === item.startDate) {
    return formatCalendarDate(item.startDate);
  }
  return `${formatCalendarDate(item.startDate)} – ${formatCalendarDate(item.endDate)}`;
}

export function holidayTypeLabel(type: HolidayType): string {
  return HOLIDAY_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function reminderKindMeta(kind: ReminderKind) {
  return REMINDER_KINDS.find((k) => k.value === kind) ?? REMINDER_KINDS[3];
}

export function holidayDateKey(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return y * 10000 + m * 100 + d;
}

export function isHolidayOnDate(item: HolidayItem, iso: string): boolean {
  if (!item.active) return false;
  const key = holidayDateKey(iso);
  const start = holidayDateKey(item.startDate);
  const end = holidayDateKey(item.endDate || item.startDate);
  return key >= start && key <= end;
}

export function isUpcoming(iso: string, today = new Date()): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return date >= startOfToday;
}

export function sortByDateAsc<T extends { startDate?: string; eventDate?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const da = a.startDate ?? a.eventDate ?? "";
    const db = b.startDate ?? b.eventDate ?? "";
    return da.localeCompare(db);
  });
}

export function groupByMonth<T extends { startDate?: string; eventDate?: string }>(
  items: T[],
  dateField: "startDate" | "eventDate"
): { month: string; label: string; items: T[] }[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const iso = item[dateField];
    if (!iso || !ISO_DATE.test(iso)) continue;
    const monthKey = iso.slice(0, 7);
    const bucket = map.get(monthKey) ?? [];
    bucket.push(item);
    map.set(monthKey, bucket);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthItems]) => {
      const [y, m] = month.split("-").map(Number);
      const label = new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      return { month, label, items: sortByDateAsc(monthItems) };
    });
}

export function filterRemindersForStudent(
  reminders: PortalReminder[],
  student: StudentProfile
): PortalReminder[] {
  return reminders.filter((r) => matchesStudentAudience(r, student));
}

export function filterActiveHolidays(holidays: HolidayItem[]): HolidayItem[] {
  return holidays.filter((h) => h.active);
}

export function upcomingHolidays(holidays: HolidayItem[], limit = 5): HolidayItem[] {
  return sortByDateAsc(filterActiveHolidays(holidays).filter((h) => isUpcoming(h.endDate || h.startDate))).slice(
    0,
    limit
  );
}

export function upcomingReminders(reminders: PortalReminder[], limit = 5): PortalReminder[] {
  return sortByDateAsc(reminders.filter((r) => r.active && isUpcoming(r.eventDate))).slice(0, limit);
}

export function emptyCalendarData(): StudentCalendarData {
  return { holidays: [], reminders: [] };
}
