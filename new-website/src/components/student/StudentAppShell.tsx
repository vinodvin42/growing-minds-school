"use client";

import { useRouter } from "next/navigation";
import type { StudentProfile } from "@/types/student";
import { clearSavedStudentAccount } from "@/lib/student-account-client";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import StudentBrand from "@/components/student/StudentBrand";

export default function StudentAppShell({
  student,
  children,
}: {
  student: StudentProfile;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initial = student.name.trim().charAt(0).toUpperCase() || "?";
  const firstName = student.name.split(" ")[0];

  async function logout() {
    await fetch("/api/student/auth/logout", { method: "POST", credentials: "same-origin" });
    clearSavedStudentAccount();
    router.replace("/student/login");
    router.refresh();
  }

  return (
    <div className="student-app">
      <header className="student-app__header">
        <div className="student-app__header-bg">
          <div className="student-app__header-pattern" aria-hidden="true" />
          <div className="student-app__header-top">
            <StudentBrand size="sm" variant="light" showTagline={false} />
            <button type="button" className="student-app__logout" onClick={logout} aria-label="Log out">
              <i className="fas fa-sign-out-alt" aria-hidden="true" />
            </button>
          </div>
          <div className="student-app__rainbow" aria-hidden="true" />
          <div className="student-app__welcome">
            <span className="student-app__avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="student-app__user-text">
              <span className="student-app__greeting">Hello, {firstName}</span>
              <span className="student-app__meta">
                {student.standard}
                {student.section ? ` · Sec ${student.section}` : ""}
                {student.rollNumber ? ` · Roll ${student.rollNumber}` : ""}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="student-app__body">{children}</div>
      <StudentBottomNav />
    </div>
  );
}
