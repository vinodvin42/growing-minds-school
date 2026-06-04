import { getCalendarForStudent } from "@/lib/student-calendar-store";
import { getStudentFeeSummary } from "@/lib/student-fees-store";
import { getStudentPortalDataForStudent } from "@/lib/student-portal-store";
import { holidayTypeLabel, reminderKindMeta } from "@/types/student-calendar";
import type { StudentNotification } from "@/types/student-notifications";
import { homeworkDueDisplay } from "@/types/student-portal";
import type { StudentProfile } from "@/types/student";

function holidayTimestamp(holiday: { createdAt?: string; startDate: string }): string {
  if (holiday.createdAt) return holiday.createdAt;
  return `${holiday.startDate}T08:00:00.000Z`;
}

export async function buildStudentNotifications(student: StudentProfile): Promise<StudentNotification[]> {
  const [portal, fees, calendar] = await Promise.all([
    getStudentPortalDataForStudent(student),
    getStudentFeeSummary(student.id),
    getCalendarForStudent(student),
  ]);

  const items: StudentNotification[] = [];

  for (const hw of portal.homework) {
    if (!hw.active) continue;
    items.push({
      id: `hw_${hw.id}`,
      kind: "homework",
      title: hw.title || "New homework",
      subtitle: homeworkDueDisplay(hw) ? `Due ${homeworkDueDisplay(hw)}` : hw.description?.slice(0, 80),
      href: "/student/homework",
      timestamp: hw.createdAt,
    });
  }

  for (const msg of portal.messages) {
    if (!msg.active) continue;
    items.push({
      id: `msg_${msg.id}`,
      kind: "message",
      title: msg.title || "School message",
      subtitle: msg.body?.slice(0, 100),
      href: "/student/messages",
      timestamp: msg.createdAt,
    });
  }

  const hasFeeData = fees.lineItems.length > 0 || fees.payments.length > 0 || fees.notes?.trim();
  if (hasFeeData && fees.updatedAt) {
    items.push({
      id: `fees_${fees.studentId}_${fees.updatedAt}`,
      kind: "fees",
      title: "Fees account updated",
      subtitle:
        fees.balance > 0
          ? `Balance due: ₹${fees.balance.toLocaleString("en-IN")}`
          : fees.totalPaid > 0
            ? "Payment recorded"
            : "View your fee details",
      href: "/student/fees",
      timestamp: fees.updatedAt,
    });
  }

  for (const hol of calendar.holidays) {
    items.push({
      id: `hol_${hol.id}`,
      kind: "holiday",
      title: hol.title || "School holiday",
      subtitle: holidayTypeLabel(hol.type),
      href: "/student/calendar",
      timestamp: holidayTimestamp(hol),
    });
  }

  for (const rem of calendar.reminders) {
    if (!rem.active) continue;
    const meta = reminderKindMeta(rem.kind);
    items.push({
      id: `rem_${rem.id}`,
      kind: "reminder",
      title: rem.title || meta.label,
      subtitle: rem.body?.slice(0, 100) || meta.label,
      href: "/student/calendar",
      timestamp: rem.createdAt,
    });
  }

  return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
