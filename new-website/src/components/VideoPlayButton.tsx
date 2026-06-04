"use client";

import { useState } from "react";
import Link from "next/link";
import type { VideoItem } from "@/types/content";

function getFeaturedVideo(videos: VideoItem[]) {
  return videos.find((v) => v.featured && v.videoUrl) || videos.find((v) => v.videoUrl);
}

export default function VideoPlayButton({
  videos,
  buttonText,
}: {
  videos: VideoItem[];
  buttonText: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const featured = getFeaturedVideo(videos);

  if (!featured) {
    return (
      <Link href="/videos" className="btn-video-play text-decoration-none">
        <i className="fas fa-play" />
        <span>{buttonText}</span>
      </Link>
    );
  }

  return (
    <>
      <button type="button" className="btn-video-play" onClick={() => setShowModal(true)}>
        <i className="fas fa-play" />
        <span>{buttonText}</span>
      </button>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{featured.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close" />
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={featured.videoUrl}
                    title={featured.title}
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
