"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setHidden(true);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem("pwa-install-dismissed", "1");
    setHidden(true);
  }

  if (hidden || !deferred) return null;

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
          <button type="button" className="btn btn-orange btn-sm" onClick={install}>
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
