"use client";

import Link from "next/link";
import { isStandalonePwa } from "@/lib/pwa-client";

export default function StudentInstallBanner() {
  if (isStandalonePwa()) return null;

  return (
    <div className="student-install-banner">
      <div className="container d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
        <span className="small mb-0">
          <i className="fas fa-mobile-alt me-2 text-orange" aria-hidden="true" />
          Install the student app for quick access from your home screen.
        </span>
        <Link href="/install-app" className="btn btn-sm btn-outline-orange">
          Install app
        </Link>
      </div>
    </div>
  );
}
