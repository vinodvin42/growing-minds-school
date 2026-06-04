import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getStudentPortalData } from "@/lib/student-portal-store";
import { matchesStudentAudience } from "@/types/student-portal";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function StudentDashboardPage() {
  const student = await getCurrentStudentProfile();
  if (!student) return null;

  const portal = await getStudentPortalData();
  const homeworkCount = portal.homework.filter((h) => matchesStudentAudience(h, student)).length;
  const messageCount = portal.messages.filter((m) => matchesStudentAudience(m, student)).length;

  return (
    <div className="container py-4 student-dashboard">
      <div className="student-dashboard__hero">
        <h1 className="h4 fw-bold mb-1">Welcome back, {student.name.split(" ")[0]}!</h1>
        <p className="text-muted mb-0 small">
          {student.standard}
          {student.section ? ` · Section ${student.section}` : ""}
          {student.rollNumber ? ` · Roll ${student.rollNumber}` : ""}
        </p>
      </div>

      <div className="row g-3 mt-1">
        <div className="col-md-4">
          <Link href="/student/messages" className="student-dash-card student-dash-card--link student-dash-card--orange">
            <i className="fas fa-bullhorn" aria-hidden="true" />
            <h2 className="h6 fw-bold">Messages</h2>
            <p className="small mb-0">
              {messageCount > 0 ? `${messageCount} notice${messageCount === 1 ? "" : "s"} for you` : "Teacher broadcasts & personal notes"}
            </p>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/student/homework" className="student-dash-card student-dash-card--link student-dash-card--lime">
            <i className="fas fa-book" aria-hidden="true" />
            <h2 className="h6 fw-bold">Homework</h2>
            <p className="small mb-0">
              {homeworkCount > 0 ? `${homeworkCount} assignment${homeworkCount === 1 ? "" : "s"}` : "Assignments & worksheets"}
            </p>
          </Link>
        </div>
        <div className="col-md-4">
          <Link href="/student/profile" className="student-dash-card student-dash-card--link student-dash-card--blue">
            <i className="fas fa-user" aria-hidden="true" />
            <h2 className="h6 fw-bold">My Profile</h2>
            <p className="small mb-0">Your class and parent contact details</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
