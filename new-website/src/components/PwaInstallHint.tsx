"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getPwaInstallMode,
  isSecureContextForPwa,
  isStandalonePwa,
  type PwaInstallMode,
} from "@/lib/pwa-client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

export default function PwaInstallHint() {
  const [mode, setMode] = useState<PwaInstallMode | null>(null);
  const [hidden, setHidden] = useState(true);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [secure, setSecure] = useState(true);

  useEffect(() => {
    if (isStandalonePwa()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const installMode = getPwaInstallMode();
    setMode(installMode);
    setSecure(isSecureContextForPwa());

    if (installMode === "ios-safari" || installMode === "ios-other-browser") {
      setHidden(false);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  async function installAndroid() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setHidden(true);
    setDeferred(null);
  }

  if (hidden || !mode || mode === "installed") return null;

  if (mode === "ios-safari") {
    return (
      <div className="pwa-install-banner pwa-install-banner--ios" role="region" aria-label="Install on iPhone">
        <div className="pwa-install-banner__inner pwa-install-banner__inner--stack">
          <div className="pwa-install-banner__top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/apple-touch-icon.png" alt="" className="pwa-install-banner__icon" />
            <div className="pwa-install-banner__text">
              <strong>Add to Home Screen (iPhone)</strong>
              <span>iOS has no Install button — follow these steps in Safari:</span>
            </div>
            <button type="button" className="pwa-install-banner__close-x" onClick={dismiss} aria-label="Dismiss">
              <i className="fas fa-times" />
            </button>
          </div>

          {!secure && (
            <p className="pwa-install-banner__warn small mb-2">
              Use the live school website (<strong>https://</strong>) on your phone — install may not work on local/dev
              URLs.
            </p>
          )}

          <ol className="pwa-ios-steps mb-0">
            <li>
              Tap <strong>Share</strong>{" "}
              <span className="pwa-ios-share-icon" aria-hidden="true">
                ↑
              </span>{" "}
              at the bottom of Safari
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong>
            </li>
            <li>
              Tap <strong>Add</strong>, then open the Growing Minds icon from your home screen
            </li>
          </ol>

          <div className="pwa-install-banner__actions pwa-install-banner__actions--row">
            <Link href="/install-app" className="btn btn-orange btn-sm">
              Full guide
            </Link>
            <button type="button" className="btn btn-link btn-sm text-white" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "ios-other-browser") {
    return (
      <div className="pwa-install-banner pwa-install-banner--ios" role="region" aria-label="Open in Safari">
        <div className="pwa-install-banner__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/apple-touch-icon.png" alt="" className="pwa-install-banner__icon" />
          <div className="pwa-install-banner__text">
            <strong>Open in Safari to install</strong>
            <span>On iPhone, copy the link and open it in Safari, then Share → Add to Home Screen.</span>
          </div>
          <div className="pwa-install-banner__actions">
            <Link href="/install-app" className="btn btn-orange btn-sm">
              How to install
            </Link>
            <button type="button" className="btn btn-link btn-sm text-white" onClick={dismiss}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (deferred) {
    return (
      <div className="pwa-install-banner" role="region" aria-label="Install app">
        <div className="pwa-install-banner__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="pwa-install-banner__icon" />
          <div className="pwa-install-banner__text">
            <strong>Install Growing Minds App</strong>
            <span>Install to open the student & parent portal</span>
          </div>
          <div className="pwa-install-banner__actions">
            <button type="button" className="btn btn-orange btn-sm" onClick={installAndroid}>
              Install
            </button>
            <button type="button" className="btn btn-link btn-sm text-white" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
