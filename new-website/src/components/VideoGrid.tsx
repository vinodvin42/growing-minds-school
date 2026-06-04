"use client";

import { useState } from "react";
import type { VideoItem } from "@/types/content";

export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [active, setActive] = useState<VideoItem | null>(null);

  if (videos.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fas fa-video fa-3x mb-3" />
        <p>No videos yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="row g-4">
        {videos.map((video) => (
          <div key={video.id} className="col-md-6 col-lg-4">
            <button
              type="button"
              className="video-card bg-white border-0 w-100 text-start p-0"
              onClick={() => setActive(video)}
            >
              <div className="position-relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={video.thumbnailUrl} alt={video.title} />
                <div className="video-thumb-play">
                  <i className="fas fa-play" />
                </div>
              </div>
              <div className="p-3">
                <span className="badge bg-orange-light text-orange mb-2">{video.category}</span>
                <h5 className="fw-bold">{video.title}</h5>
                <p className="text-muted small mb-0">{video.description}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {active && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setActive(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{active.title}</h5>
                <button type="button" className="btn-close" onClick={() => setActive(null)} aria-label="Close" />
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={active.videoUrl}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
