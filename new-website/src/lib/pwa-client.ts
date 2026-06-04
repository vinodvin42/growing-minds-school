/** Detect installed PWA / Add to Home Screen (client only). */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const fullscreenMedia = window.matchMedia("(display-mode: fullscreen)").matches;
  const minimalUiMedia = window.matchMedia("(display-mode: minimal-ui)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneMedia || fullscreenMedia || minimalUiMedia || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** iPhone/iPad in Safari (not Chrome, Firefox, etc.) */
export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return isIosDevice() && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export function isSecureContextForPwa(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext;
}

export function isPwaDevBypass(): boolean {
  return process.env.NEXT_PUBLIC_PWA_DEV_BYPASS === "true";
}

export function canAccessStudentPortal(): boolean {
  return isStandalonePwa() || isPwaDevBypass();
}

export type PwaInstallMode = "ios-safari" | "ios-other-browser" | "android" | "desktop" | "installed";

export function getPwaInstallMode(): PwaInstallMode {
  if (typeof window === "undefined") return "desktop";
  if (isStandalonePwa()) return "installed";
  if (isIosSafari()) return "ios-safari";
  if (isIosDevice()) return "ios-other-browser";
  if (/Android/i.test(navigator.userAgent)) return "android";
  return "desktop";
}
