/** Detect installed PWA / Add to Home Screen (client only). */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const fullscreenMedia = window.matchMedia("(display-mode: fullscreen)").matches;
  const minimalUiMedia = window.matchMedia("(display-mode: minimal-ui)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneMedia || fullscreenMedia || minimalUiMedia || iosStandalone;
}

export function isPwaDevBypass(): boolean {
  return process.env.NEXT_PUBLIC_PWA_DEV_BYPASS === "true";
}

export function canAccessStudentPortal(): boolean {
  return isStandalonePwa() || isPwaDevBypass();
}
