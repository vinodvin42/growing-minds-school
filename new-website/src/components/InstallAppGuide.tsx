"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { canAccessStudentPortal } from "@/lib/pwa-client";

export default function InstallAppGuide() {
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from");
  const inApp = canAccessStudentPortal();

  if (inApp) {
    return (
      <div className="install-app-guide install-app-guide--ready text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="install-app-guide__icon" />
        <h2 className="h4 fw-bold mb-2">App ready</h2>
        <p className="text-muted mb-4">You&apos;re using the installed app. Continue to the student portal.</p>
        <Link href="/student/login" className="btn btn-orange btn-lg">
          Open Student Login
        </Link>
      </div>
    );
  }

  return (
    <div className="row g-4 align-items-start">
      <div className="col-lg-5">
        <div className="install-app-guide__card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-512.png" alt="" className="install-app-guide__icon mb-3" />
          <h2 className="h4 fw-bold mb-2">Student portal is app-only</h2>
          <p className="text-muted mb-0">
            For security and a better mobile experience, student login and related pages are available only after you
            install the Growing Minds app on your phone or tablet.
          </p>
          {fromPath && (
            <p className="install-app-guide__note small mt-3 mb-0">
              <i className="fas fa-lock me-2 text-orange" aria-hidden="true" />
              <span>
                <strong>{fromPath}</strong> opens automatically after install.
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="col-lg-7">
        <div className="install-app-guide__steps">
          <h3 className="h5 fw-bold mb-3">How to install</h3>

          <div className="install-app-step">
            <span className="install-app-step__num">1</span>
            <div>
              <strong>Android (Chrome)</strong>
              <p className="mb-0 text-muted small">Menu ⋮ → Install app / Add to Home screen</p>
            </div>
          </div>

          <div className="install-app-step">
            <span className="install-app-step__num">2</span>
            <div>
              <strong>iPhone (Safari)</strong>
              <p className="mb-0 text-muted small">Share → Add to Home Screen → Add</p>
            </div>
          </div>

          <div className="install-app-step">
            <span className="install-app-step__num">3</span>
            <div>
              <strong>Open from your home screen</strong>
              <p className="mb-0 text-muted small">Launch the Growing Minds icon — student login will appear inside the app.</p>
            </div>
          </div>
        </div>

        <div className="install-app-guide__public mt-4">
          <p className="mb-2 fw-semibold">Looking for the public website?</p>
          <div className="d-flex flex-wrap gap-2">
            <Link href="/" className="btn btn-outline-secondary btn-sm">
              Home
            </Link>
            <Link href="/admissions" className="btn btn-orange btn-sm">
              Admissions
            </Link>
            <Link href="/contact" className="btn btn-outline-secondary btn-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
