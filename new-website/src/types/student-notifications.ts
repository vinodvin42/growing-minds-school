export type StudentNotificationKind = "homework" | "message" | "fees" | "holiday" | "reminder";

export type StudentNotificationSection = "homework" | "messages" | "fees" | "calendar";

export interface StudentNotification {
  id: string;
  kind: StudentNotificationKind;
  title: string;
  subtitle?: string;
  href: string;
  /** ISO timestamp — when admin posted / updated */
  timestamp: string;
}

export interface StudentNotificationCounts {
  homework: number;
  messages: number;
  fees: number;
  calendar: number;
  total: number;
}

export const NOTIFICATION_SECTION_LABELS: Record<StudentNotificationSection, string> = {
  homework: "Homework",
  messages: "Messages",
  fees: "Fees",
  calendar: "Calendar",
};

export function notificationKindIcon(kind: StudentNotificationKind): string {
  switch (kind) {
    case "homework":
      return "fa-book";
    case "message":
      return "fa-bullhorn";
    case "fees":
      return "fa-wallet";
    case "holiday":
      return "fa-umbrella-beach";
    case "reminder":
      return "fa-bell";
    default:
      return "fa-bell";
  }
}

export function notificationKindLabel(kind: StudentNotificationKind): string {
  switch (kind) {
    case "homework":
      return "New homework";
    case "message":
      return "New message";
    case "fees":
      return "Fees update";
    case "holiday":
      return "Holiday added";
    case "reminder":
      return "Reminder";
    default:
      return "Update";
  }
}

export function sectionForNotificationKind(kind: StudentNotificationKind): StudentNotificationSection {
  if (kind === "message") return "messages";
  if (kind === "holiday" || kind === "reminder") return "calendar";
  return kind as StudentNotificationSection;
}

export function emptyNotificationCounts(): StudentNotificationCounts {
  return { homework: 0, messages: 0, fees: 0, calendar: 0, total: 0 };
}

export function countNotificationsBySection(
  items: StudentNotification[]
): StudentNotificationCounts {
  const counts = emptyNotificationCounts();
  for (const item of items) {
    const section = sectionForNotificationKind(item.kind);
    counts[section] += 1;
  }
  counts.total = items.length;
  return counts;
}
