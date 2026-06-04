import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getStudentPortalDataForStudent } from "@/lib/student-portal-store";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function StudentDashboardPage() {
  const student = await getCurrentStudentProfile();
  if (!student) return null;

  const portal = await getStudentPortalDataForStudent(student);
  const homeworkCount = portal.homework.length;
  const messageCount = portal.messages.length;

  return (
    <div className="student-page">
      <StudentPageHeader
        title="Dashboard"
        subtitle={`${student.standard}${student.section ? ` · Section ${student.section}` : ""}${student.rollNumber ? ` · Roll ${student.rollNumber}` : ""}`}
      />

      <div className="student-quick-grid">
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
        <Link href="/student/profile" className="student-quick-card student-quick-card--blue">
          <span className="student-quick-card__icon" aria-hidden="true">
            <i className="fas fa-user" />
          </span>
          <span className="student-quick-card__label">My Profile</span>
          <span className="student-quick-card__hint">Your details</span>
        </Link>
        <div className="student-quick-card student-quick-card--muted">
          <span className="student-quick-card__icon" aria-hidden="true">
            <i className="fas fa-id-badge" />
          </span>
          <span className="student-quick-card__label">Student ID</span>
          <span className="student-quick-card__hint">{student.loginId}</span>
        </div>
      </div>

      <section className="student-tip-card">
        <i className="fas fa-lightbulb student-tip-card__icon" aria-hidden="true" />
        <p className="mb-0">
          Check <strong>Homework</strong> and <strong>Messages</strong> daily. Tap the tabs below to switch pages.
        </p>
      </section>
    </div>
  );
}
