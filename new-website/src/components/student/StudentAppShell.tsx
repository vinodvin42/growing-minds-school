"use client";

import { useRouter } from "next/navigation";
import type { StudentProfile } from "@/types/student";
import { clearSavedStudentAccount } from "@/lib/student-account-client";
import StudentBottomNav from "@/components/student/StudentBottomNav";

export default function StudentAppShell({
  student,
  children,
}: {
  student: StudentProfile;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const initial = student.name.trim().charAt(0).toUpperCase() || "?";

  async function logout() {
    await fetch("/api/student/auth/logout", { method: "POST", credentials: "same-origin" });
    clearSavedStudentAccount();
    router.replace("/student/login");
    router.refresh();
  }

  return (
    <div className="student-app">
      <header className="student-app__topbar">
        <div className="student-app__user">
          <span className="student-app__avatar" aria-hidden="true">
            {initial}
          </span>
          <div className="student-app__user-text">
            <span className="student-app__greeting">Hello, {student.name.split(" ")[0]}</span>
            <span className="student-app__meta">
              {student.standard}
              {student.section ? ` · Sec ${student.section}` : ""}
            </span>
          </div>
        </div>
        <button type="button" className="student-app__logout" onClick={logout} aria-label="Log out">
          <i className="fas fa-sign-out-alt" aria-hidden="true" />
        </button>
      </header>

      <div className="student-app__body">{children}</div>
      <StudentBottomNav />
    </div>
  );
}
