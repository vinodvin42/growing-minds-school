import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getStudentPortalDataForStudent } from "@/lib/student-portal-store";
import { getStudentFeeSummary } from "@/lib/student-fees-store";
import { getCalendarForStudent } from "@/lib/student-calendar-store";
import { formatInr, feeStatusLabel } from "@/types/student-fees";
import { upcomingHolidays, upcomingReminders } from "@/types/student-calendar";
import StudentPageHeader from "@/components/student/StudentPageHeader";
import { StudentUpcomingCalendar } from "@/components/student/StudentCalendarView";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function StudentDashboardPage() {
  const student = await getCurrentStudentProfile();
  if (!student) return null;

  const [portal, fees, calendar] = await Promise.all([
    getStudentPortalDataForStudent(student),
    getStudentFeeSummary(student.id),
    getCalendarForStudent(student),
  ]);

  const homeworkCount = portal.homework.length;
  const messageCount = portal.messages.length;
  const upcomingCount =
    upcomingHolidays(calendar.holidays, 10).length + upcomingReminders(calendar.reminders, 10).length;

  return (
    <div className="student-page">
      <StudentPageHeader
        title="Your updates"
        subtitle="Homework, calendar, fees, and school notices in one place"
      />

      <StudentUpcomingCalendar limit={4} />

      <div className="student-quick-grid">
        <Link href="/student/calendar" className="student-quick-card student-quick-card--yellow">
          <span className="student-quick-card__icon" aria-hidden="true">
            <i className="fas fa-calendar-alt" />
          </span>
          <span className="student-quick-card__label">Calendar</span>
          <span className="student-quick-card__hint">
            {upcomingCount > 0 ? `${upcomingCount} upcoming` : "Holidays & PTM"}
          </span>
        </Link>
        <Link href="/student/messages" className="student-quick-card student-quick-card--orange">
          <span className="student-quick-card__icon" aria-hidden="true">
            <i className="fas fa-bullhorn" />
          </span>
          <span className="student-quick-card__label">Messages</span>
          <span className="student-quick-card__hint">
            {messageCount > 0 ? `${messageCount} new` : "School notices"}
          </span>
        </Link>
        <Link href="/student/homework" className="student-quick-card student-quick-card--lime">
          <span className="student-quick-card__icon" aria-hidden="true">
            <i className="fas fa-book" />
          </span>
          <span className="student-quick-card__label">Homework</span>
          <span className="student-quick-card__hint">
            {homeworkCount > 0 ? `${homeworkCount} tasks` : "Assignments"}
          </span>
        </Link>
        <Link href="/student/fees" className="student-quick-card student-quick-card--purple">
          <span className="student-quick-card__icon" aria-hidden="true">
            <i className="fas fa-wallet" />
          </span>
          <span className="student-quick-card__label">Fees</span>
          <span className="student-quick-card__hint">
            {fees.balance > 0
              ? `${formatInr(fees.balance)} due`
              : fees.totalDue > 0
                ? feeStatusLabel(fees.status)
                : "View account"}
          </span>
        </Link>
      </div>

      <section className="student-tip-card">
        <i className="fas fa-lightbulb student-tip-card__icon" aria-hidden="true" />
        <p className="mb-0">
          Check the <strong>Calendar</strong> for holidays and PTM. Keep up with <strong>Homework</strong> and{" "}
          <strong>Fees</strong> too.
        </p>
      </section>
    </div>
  );
}
