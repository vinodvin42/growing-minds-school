"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  canAccessStudentPortal,
  getPwaInstallMode,
  isSecureContextForPwa,
  type PwaInstallMode,
} from "@/lib/pwa-client";

function IosSafariSteps() {
  return (
    <div className="install-ios-panel">
      <div className="install-ios-panel__header">
        <span className="install-ios-panel__badge">iPhone / iPad</span>
        <h3 className="h5 fw-bold mb-2">Install using Safari</h3>
        <p className="text-muted small mb-0">
          Apple does not show an &quot;Install app&quot; button. You must use <strong>Safari</strong> and Add to Home
          Screen manually.
        </p>
      </div>

      <ol className="install-ios-panel__steps">
        <li>
          <span className="install-ios-panel__step-icon" aria-hidden="true">
            1
          </span>
          <div>
            <strong>Open this website in Safari</strong>
            <p className="mb-0 small text-muted">If you are in Chrome or WhatsApp, copy the link and open it in Safari.</p>
          </div>
        </li>
        <li>
          <span className="install-ios-panel__step-icon install-ios-panel__step-icon--share" aria-hidden="true">
            ↑
          </span>
          <div>
            <strong>Tap Share at the bottom</strong>
            <p className="mb-0 small text-muted">Square icon with an arrow pointing up</p>
          </div>
        </li>
        <li>
          <span className="install-ios-panel__step-icon" aria-hidden="true">
            +
          </span>
          <div>
            <strong>Add to Home Screen</strong>
            <p className="mb-0 small text-muted">Scroll the share menu if you don&apos;t see it</p>
          </div>
        </li>
        <li>
          <span className="install-ios-panel__step-icon" aria-hidden="true">
            ✓
          </span>
          <div>
            <strong>Tap Add, then open the home screen icon</strong>
            <p className="mb-0 small text-muted">Student login opens inside the installed app</p>
          </div>
        </li>
      </ol>
    </div>
  );
}

export default function InstallAppGuide() {
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from");
  const [inApp, setInApp] = useState(false);
  const [mode, setMode] = useState<PwaInstallMode>("desktop");
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    setInApp(canAccessStudentPortal());
    setMode(getPwaInstallMode());
    setSecure(isSecureContextForPwa());
  }, []);

  if (inApp) {
    return (
      <div className="install-app-guide install-app-guide--ready text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/apple-touch-icon.png" alt="" className="install-app-guide__icon" />
        <h2 className="h4 fw-bold mb-2">App installed successfully</h2>
        <p className="text-muted mb-4">You&apos;re using the Growing Minds app. Continue to the student portal.</p>
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
            Install the Growing Minds app on your phone. Student login and school portal pages work only from the home
            screen icon — not in a normal browser tab.
          </p>
          {fromPath && (
            <p className="install-app-guide__note small mt-3 mb-0">
              <i className="fas fa-lock me-2 text-orange" aria-hidden="true" />
              <span>
                <strong>{fromPath}</strong> opens after you install and launch the app.
              </span>
            </p>
          )}
          {!secure && (
            <p className="install-app-guide__note small mt-3 mb-0">
              <i className="fas fa-exclamation-triangle me-2 text-orange" aria-hidden="true" />
              Use your live website URL with <strong>https://</strong> on your phone (not localhost).
            </p>
          )}
        </div>
      </div>

      <div className="col-lg-7">
        {(mode === "ios-safari" || mode === "ios-other-browser") && <IosSafariSteps />}

        {mode === "ios-other-browser" && (
          <div className="alert alert-warning mt-3 mb-0 small">
            You appear to be on iPhone but not Safari. Please open this page in <strong>Safari</strong> to install.
          </div>
        )}

        {(mode === "android" || mode === "desktop") && (
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
                <strong>iPhone (Safari only)</strong>
                <p className="mb-0 text-muted small">Share ↑ → Add to Home Screen → Add</p>
              </div>
            </div>

            <div className="install-app-step">
              <span className="install-app-step__num">3</span>
              <div>
                <strong>Open from home screen</strong>
                <p className="mb-0 text-muted small">Launch the Growing Minds icon — not from browser bookmarks.</p>
              </div>
            </div>
          </div>
        )}

        {mode === "ios-safari" && (
          <div className="install-app-guide__steps mt-3">
            <h3 className="h6 fw-bold mb-2">Android users</h3>
            <p className="small text-muted mb-0">Chrome menu ⋮ → Install app / Add to Home screen</p>
          </div>
        )}

        <div className="install-app-guide__public mt-4">
          <p className="mb-2 fw-semibold">Public website (no install needed)</p>
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
