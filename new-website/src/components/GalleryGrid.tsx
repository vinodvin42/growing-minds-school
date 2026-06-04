"use client";

import { useMemo, useState } from "react";
import type { GalleryImage } from "@/types/content";

const DEFAULT_CATEGORIES = ["Campus", "Events", "Activities", "Sports", "Other"];

function displayTitle(img: GalleryImage) {
  return img.title || img.alt || "Photo";
}

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const fromImages = images.map((img) => img.category?.trim()).filter(Boolean) as string[];
    const unique = [...new Set([...DEFAULT_CATEGORIES, ...fromImages])];
    return ["All", ...unique];
  }, [images]);

  const filtered = useMemo(() => {
    if (filter === "All") return images;
    return images.filter((img) => (img.category || "Other") === filter);
  }, [filter, images]);

  if (images.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-images fa-3x mb-3" />
        <p>No photos yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-filters mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`gallery-filter-btn ${filter === cat ? "is-active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p className="mb-0">No photos in this category yet.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((img) => (
            <div key={img.id} className="col-sm-6 col-lg-4">
              <button
                type="button"
                className="gallery-card w-100 border-0 p-0 text-start"
                onClick={() => setActive(img)}
              >
                <div className="gallery-card__image-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt={img.alt} className="gallery-card__image" />
                  <div className="gallery-card__overlay">
                    {img.category && <span className="gallery-card__badge">{img.category}</span>}
                    <h3 className="gallery-card__title">{displayTitle(img)}</h3>
                    {img.caption && <p className="gallery-card__caption">{img.caption}</p>}
                    <span className="gallery-card__view">
                      <i className="fas fa-expand me-1" />
                      View
                    </span>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {active && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={displayTitle(active)}
          onClick={() => setActive(null)}
        >
          <div className="gallery-lightbox__dialog" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="gallery-lightbox__close" onClick={() => setActive(null)} aria-label="Close">
              <i className="fas fa-times" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.imageUrl} alt={active.alt} className="gallery-lightbox__image" />
            <div className="gallery-lightbox__content">
              {active.category && <span className="badge bg-orange-light text-orange mb-2">{active.category}</span>}
              <h2 className="gallery-lightbox__title">{displayTitle(active)}</h2>
              {active.caption && <p className="gallery-lightbox__caption mb-0">{active.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
