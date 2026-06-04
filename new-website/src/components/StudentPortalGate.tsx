"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccessStudentPortal, isStandalonePwa } from "@/lib/pwa-client";
import StudentInstallBanner from "@/components/student/StudentInstallBanner";

const LOGIN_PATHS = new Set(["/student", "/student/login"]);

/** Login works in any browser; app pages suggest installing the PWA when not standalone. */
export default function StudentPortalGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onLoginRoute = LOGIN_PATHS.has(pathname ?? "");
  const needsInstall = !onLoginRoute && !canAccessStudentPortal();

  if (needsInstall) {
    const params = new URLSearchParams();
    if (pathname) params.set("from", pathname);
    return (
      <div className="student-portal min-vh-100 d-flex flex-column">
        <div className="container py-5 flex-grow-1">
          <div className="student-portal-card text-center mx-auto" style={{ maxWidth: 480 }}>
            <div className="student-portal-card__badge mb-3" aria-hidden="true">
              📱
            </div>
            <h1 className="h4 fw-bold mb-2">Open the Student App</h1>
            <p className="text-muted mb-4">
              Homework and messages work best in the installed student app. Add Growing Minds to your home screen, then sign in.
            </p>
            <Link href={`/install-app?${params.toString()}`} className="btn btn-orange btn-lg w-100 mb-3">
              How to install
            </Link>
            <Link href="/student/login" className="btn btn-outline-secondary w-100">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isStandalonePwa() && <StudentInstallBanner />}
      {children}
    </>
  );
}
