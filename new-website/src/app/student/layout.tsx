import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { PWA } from "@/lib/pwa";
import StudentPortalGate from "@/components/StudentPortalGate";
import StudentAuthBootstrap from "@/components/student/StudentAuthBootstrap";
import StudentBrand from "@/components/student/StudentBrand";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Growing Minds student and parent portal.",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: `${PWA.shortName} Portal`,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: PWA.themeColor,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentPortalGate>
      <StudentAuthBootstrap />
      <div className="student-portal min-vh-100 d-flex flex-column">
        <header className="student-portal__header student-portal__header--public">
          <div className="student-portal__header-inner">
            <StudentBrand size="sm" showTagline={false} />
            <Link href="/install-app" className="student-portal__help-btn">
              <i className="fas fa-circle-info" aria-hidden="true" />
              <span>Help</span>
            </Link>
          </div>
        </header>
        <main className="student-portal__main flex-grow-1">{children}</main>
      </div>
    </StudentPortalGate>
  );
}
