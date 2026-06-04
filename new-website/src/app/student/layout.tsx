import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { images } from "@/data/images";
import { PWA } from "@/lib/pwa";
import StudentPortalGate from "@/components/StudentPortalGate";

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
};

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentPortalGate>
      <div className="student-portal min-vh-100 d-flex flex-column">
        <header className="student-portal__header">
          <div className="container d-flex align-items-center justify-content-between py-3">
            <div className="student-portal__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images.favicon} alt="" className="student-portal__logo" />
              <span>Student Portal</span>
            </div>
            <Link href="/install-app" className="student-portal__home-link">
              <i className="fas fa-info-circle" aria-hidden="true" />
              <span className="d-none d-sm-inline">App help</span>
            </Link>
          </div>
        </header>
        <main className="student-portal__main flex-grow-1 d-flex flex-column">{children}</main>
      </div>
    </StudentPortalGate>
  );
}
