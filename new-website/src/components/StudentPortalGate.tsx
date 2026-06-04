"use client";

import StudentInstallBanner from "@/components/student/StudentInstallBanner";
import { isStandalonePwa } from "@/lib/pwa-client";

/** Student portal — login and app work in browser and installed PWA. */
export default function StudentPortalGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {!isStandalonePwa() && <StudentInstallBanner />}
      {children}
    </>
  );
}
