"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StudentProfile } from "@/types/student";
import { clearSavedStudentAccount } from "@/lib/student-account-client";

export default function StudentNav({ student }: { student: StudentProfile }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/student/auth/logout", { method: "POST", credentials: "same-origin" });
    clearSavedStudentAccount();
    router.replace("/student/login");
    router.refresh();
  }

  return (
    <div className="student-app-nav">
      <div className="container">
        <div className="student-app-nav__welcome">
          <span className="student-app-nav__hello">Hello,</span>
          <strong>{student.name}</strong>
          <span className="student-app-nav__meta">
            {student.standard}
            {student.section ? ` · Section ${student.section}` : ""}
          </span>
        </div>
        <div className="student-app-nav__links">
          <Link href="/student/messages" className="student-app-nav__link">
            <i className="fas fa-bullhorn" aria-hidden="true" />
            Messages
          </Link>
          <Link href="/student/homework" className="student-app-nav__link">
            <i className="fas fa-book" aria-hidden="true" />
            Homework
          </Link>
          <Link href="/student/dashboard" className="student-app-nav__link">
            <i className="fas fa-home" aria-hidden="true" />
            Home
          </Link>
          <Link href="/student/profile" className="student-app-nav__link">
            <i className="fas fa-user" aria-hidden="true" />
            Profile
          </Link>
          <button type="button" className="student-app-nav__link student-app-nav__link--btn" onClick={logout}>
            <i className="fas fa-sign-out-alt" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
