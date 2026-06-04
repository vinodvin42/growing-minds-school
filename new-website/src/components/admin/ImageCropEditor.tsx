"use client";

import { useMemo } from "react";
import { IMAGE_FOCUS_OPTIONS } from "@/data/image-focus-options";
import { clampFocus, parseFocusString, type ImageFit } from "@/lib/image-crop";

export type ImageCropEditorProps = {
  imageUrl: string;
  fit?: ImageFit;
  focusX?: number;
  focusY?: number;
  focus?: string;
  previewVariant?: "carousel" | "about";
  onChange: (values: { fit: ImageFit; focusX: number; focusY: number }) => void;
};

function getPreviewFrameClass(variant: "carousel" | "about", fit: ImageFit) {
  if (variant === "carousel") {
    return [
      "carousel-split__image-wrap",
      "image-crop-editor__target",
      fit === "contain" ? "carousel-split__image-wrap--contain" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    "content-image-frame",
    "content-image-frame--landscape",
    "image-crop-editor__target",
    fit === "contain" ? "content-image-frame--contain" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function ImageCropEditor({
  imageUrl,
  fit: fitProp,
  focusX: focusXProp,
  focusY: focusYProp,
  focus,
  previewVariant = "carousel",
  onChange,
}: ImageCropEditorProps) {
  const parsed = useMemo(() => {
    if (focusXProp != null && focusYProp != null) {
      return { x: focusXProp, y: focusYProp };
    }
    return parseFocusString(focus);
  }, [focus, focusXProp, focusYProp]);

  const fit = fitProp ?? "cover";
  const focusX = parsed.x;
  const focusY = parsed.y;
  const frameClass = getPreviewFrameClass(previewVariant, fit);
  const previewLabel =
    previewVariant === "carousel" ? "Homepage carousel image box" : "About page image box";

  function update(partial: Partial<{ fit: ImageFit; focusX: number; focusY: number }>) {
    onChange({
      fit: partial.fit ?? fit,
      focusX: clampFocus(partial.focusX ?? focusX),
      focusY: clampFocus(partial.focusY ?? focusY),
    });
  }

  function handlePreviewClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    update({ focusX: x, focusY: y });
  }

  if (!imageUrl) {
    return <p className="text-muted small mb-0">Upload or paste an image URL to adjust crop.</p>;
  }

  return (
    <div className="image-crop-editor">
      <span className="image-crop-editor__label">{previewLabel}</span>
      <p className="small text-muted mb-2">
        This preview uses the same size and frame as the live website. Click the photo where faces should stay visible.
      </p>

      <div className={`image-crop-editor__viewport image-crop-editor__viewport--${previewVariant}`}>
        <div
          className={frameClass}
          onClick={handlePreviewClick}
          role="button"
          tabIndex={0}
          aria-label="Click to set image focus point"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Crop preview"
            style={{
              objectFit: fit,
              objectPosition: `${focusX}% ${focusY}%`,
            }}
          />
          <span
            className="image-crop-editor__marker"
            style={{ left: `${focusX}%`, top: `${focusY}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="row g-2 mt-3">
        <div className="col-md-4">
          <label className="form-label small mb-1">Fit in frame</label>
          <select
            className="form-select form-select-sm"
            value={fit}
            onChange={(e) => update({ fit: e.target.value as ImageFit })}
          >
            <option value="cover">Crop to fill (recommended)</option>
            <option value="contain">Show full image</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label small mb-1">Horizontal focus ({focusX}%)</label>
          <input
            type="range"
            className="form-range"
            min={0}
            max={100}
            value={focusX}
            onChange={(e) => update({ focusX: Number(e.target.value) })}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small mb-1">Vertical focus ({focusY}%)</label>
          <input
            type="range"
            className="form-range"
            min={0}
            max={100}
            value={focusY}
            onChange={(e) => update({ focusY: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-2">
        {IMAGE_FOCUS_OPTIONS.map((opt) => {
          const [x, y] = opt.value.split(" ");
          return (
            <button
              key={opt.value}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() =>
                update({
                  focusX: Number.parseFloat(x),
                  focusY: Number.parseFloat(y),
                })
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
