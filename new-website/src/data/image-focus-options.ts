export const DEFAULT_IMAGE_FOCUS = "50% 32%";

export const IMAGE_FOCUS_OPTIONS = [
  { value: "50% 32%", label: "Faces centered" },
  { value: "50% 22%", label: "Faces upper (show heads)" },
  { value: "50% 50%", label: "Image center" },
  { value: "50% 20%", label: "Show top" },
  { value: "55% 32%", label: "Faces right" },
  { value: "45% 32%", label: "Faces left" },
] as const;
