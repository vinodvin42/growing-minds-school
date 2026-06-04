import { DEFAULT_IMAGE_FOCUS } from "@/data/image-focus-options";

export type ImageFit = "cover" | "contain";

export type ImageCropValues = {
  fit?: ImageFit;
  focusX?: number;
  focusY?: number;
  /** @deprecated legacy string focus */
  focus?: string;
};

export function parseFocusString(focus?: string): { x: number; y: number } {
  if (!focus) {
    const [x, y] = DEFAULT_IMAGE_FOCUS.split(" ");
    return { x: Number.parseFloat(x), y: Number.parseFloat(y) };
  }

  const parts = focus.trim().split(/\s+/);
  const parsePart = (part: string, fallback: number) => {
    if (part === "center") return 50;
    if (part === "top" || part === "left") return 0;
    if (part === "bottom" || part === "right") return 100;
    if (part.endsWith("%")) return Number.parseFloat(part);
    return fallback;
  };

  return {
    x: parsePart(parts[0] ?? "50%", 50),
    y: parsePart(parts[1] ?? "32%", 32),
  };
}

export function resolveImageCrop(settings: ImageCropValues) {
  const fit = settings.fit ?? "cover";
  if (settings.focusX != null && settings.focusY != null) {
    return {
      fit,
      position: `${clampFocus(settings.focusX)}% ${clampFocus(settings.focusY)}%`,
      focusX: clampFocus(settings.focusX),
      focusY: clampFocus(settings.focusY),
    };
  }

  const parsed = parseFocusString(settings.focus);
  return {
    fit,
    position: `${parsed.x}% ${parsed.y}%`,
    focusX: parsed.x,
    focusY: parsed.y,
  };
}

export function clampFocus(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}
