"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { saveStudentAccount } from "@/lib/student-account-client";
import type { StudentProfile } from "@/types/student";

const LOGIN = "/student/login";

function isLoginPath(path: string | null): boolean {
  return path === LOGIN || path === "/student";
}

function isProtectedStudentPath(path: string | null): boolean {
  if (!path?.startsWith("/student/")) return false;
  return !isLoginPath(path);
}

function toSavedAccount(student: StudentProfile) {
  return {
    loginId: student.loginId,
    name: student.name,
    standard: student.standard,
    section: student.section,
  };
}

/** Keeps PWA on login when signed out and restores dashboard when session cookie is valid. */
export default function StudentAuthBootstrap() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      try {
        const res = await fetch("/api/student/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data.student) saveStudentAccount(toSavedAccount(data.student));
          if (isLoginPath(pathname)) {
            router.replace("/student/dashboard");
          }
          return;
        }

        if (isProtectedStudentPath(pathname)) {
          router.replace(LOGIN);
        }
      } catch {
        if (!cancelled && isProtectedStudentPath(pathname)) {
          router.replace(LOGIN);
        }
      }
    }

    syncSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
