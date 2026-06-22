import { formatInr } from "@/types/student-fees";
import type { StudentFeeAccount } from "@/types/student-fees";
import type { StudentRecord } from "@/types/student";
import type { HomeworkItem, TeacherMessage } from "@/types/student-portal";
import type { HolidayItem, PortalReminder } from "@/types/student-calendar";
import { classSlug } from "@/lib/portal-storage-paths";

export type AdminPublishLog = {
  title: string;
  lines: string[];
};

export function liveSiteNote(): string {
  return "Live site will refresh in about 1 minute.";
}

export function buildFeePublishLog(
  accounts: StudentFeeAccount[],
  students: { id: string; name: string; loginId: string }[]
): AdminPublishLog {
  const byId = new Map(students.map((s) => [s.id, s]));
  const lines: string[] = [`Published ${accounts.length} fee account(s) in one GitHub update.`];

  const withActivity = accounts.filter((a) => a.lineItems.length > 0 || a.payments.length > 0);
  const sample = (withActivity.length > 0 ? withActivity : accounts).slice(0, 6);

  for (const account of sample) {
    const student = byId.get(account.studentId);
    const name = student?.name || student?.loginId || account.studentId;
    const due = account.lineItems.reduce((s, i) => s + i.amount, 0);
    const paid = account.payments.reduce((s, p) => s + p.amount, 0);
    const balance = Math.max(0, due - paid);
    lines.push(`• ${name}: ${formatInr(due)} due, ${formatInr(paid)} paid, ${formatInr(balance)} balance`);
  }

  const total = withActivity.length > 0 ? withActivity.length : accounts.length;
  if (total > sample.length) {
    lines.push(`… and ${total - sample.length} more student(s).`);
  }

  lines.push(liveSiteNote());
  return { title: "Fee accounts updated", lines };
}

export function buildStudentPublishLog(students: StudentRecord[]): AdminPublishLog {
  const classes = new Set(students.map((s) => classSlug(s.standard)));
  const active = students.filter((s) => s.active).length;
  const lines: string[] = [
    `Published ${students.length} student(s) across ${classes.size} class file(s).`,
    `Active: ${active} · Inactive: ${students.length - active}`,
  ];

  for (const student of students.slice(0, 5)) {
    lines.push(`• ${student.name} (${student.loginId}) — ${student.standard}`);
  }
  if (students.length > 5) {
    lines.push(`… and ${students.length - 5} more.`);
  }

  lines.push(liveSiteNote());
  return { title: "Student roster updated", lines };
}

export function buildHomeworkPublishLog(items: HomeworkItem[]): AdminPublishLog {
  const lines: string[] = [`Published ${items.length} homework item(s).`];
  for (const item of items.slice(0, 5)) {
    lines.push(`• ${item.title || "Untitled"} — ${item.standard}${item.section ? ` ${item.section}` : ""}`);
  }
  if (items.length > 5) lines.push(`… and ${items.length - 5} more.`);
  lines.push(liveSiteNote());
  return { title: "Homework updated", lines };
}

export function buildMessagesPublishLog(items: TeacherMessage[]): AdminPublishLog {
  const lines: string[] = [`Published ${items.length} message(s).`];
  for (const item of items.slice(0, 5)) {
    lines.push(`• ${item.title || "Untitled"} (${item.kind === "individual" ? "individual" : "broadcast"})`);
  }
  if (items.length > 5) lines.push(`… and ${items.length - 5} more.`);
  lines.push(liveSiteNote());
  return { title: "Messages updated", lines };
}

export function buildCalendarPublishLog(holidays: HolidayItem[], reminders: PortalReminder[]): AdminPublishLog {
  const lines: string[] = [
    `Published ${holidays.length} holiday(s) and ${reminders.length} reminder(s).`,
  ];
  for (const h of holidays.slice(0, 3)) {
    lines.push(`• Holiday: ${h.title || "Untitled"}`);
  }
  for (const r of reminders.slice(0, 3)) {
    lines.push(`• Reminder: ${r.title || "Untitled"}`);
  }
  const extra = holidays.length + reminders.length - 6;
  if (extra > 0) lines.push(`… and ${extra} more item(s).`);
  lines.push(liveSiteNote());
  return { title: "Calendar updated", lines };
}

export function buildWebsitePublishLog(tabLabel: string): AdminPublishLog {
  return {
    title: "Website content updated",
    lines: [`Published changes for ${tabLabel}.`, liveSiteNote()],
  };
}
