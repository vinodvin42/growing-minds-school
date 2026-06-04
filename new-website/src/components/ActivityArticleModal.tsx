"use client";

import { useEffect } from "react";
import type { StudentActivity } from "@/types/content";
import { activityArticleLead, activityArticleParagraphs, activityEmoji } from "@/lib/activities";

export default function ActivityArticleModal({
  activity,
  onClose,
}: {
  activity: StudentActivity;
  onClose: () => void;
}) {
  const paragraphs = activityArticleParagraphs(activity);
  const lead = activityArticleLead(activity);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="activity-article-modal"
      role="dialog"
      aria-modal="true"
      aria-label={activity.title}
      onClick={onClose}
    >
      <div className="activity-article-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="activity-article-modal__close" onClick={onClose} aria-label="Close">
          <i className="fas fa-times" />
        </button>

        <div className="activity-article-modal__layout">
          <figure className="activity-article-modal__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activity.imageUrl} alt={activity.alt} className="activity-article-modal__image" />
            {activity.alt && <figcaption className="activity-article-modal__caption">{activity.alt}</figcaption>}
          </figure>

          <article className="activity-article-modal__article">
            <header className="activity-article-modal__header">
              <div className="activity-article-modal__meta">
                <span className="activity-article-modal__emoji" aria-hidden="true">
                  {activityEmoji(activity.category)}
                </span>
                <span className="activity-article-modal__category">{activity.category}</span>
                {activity.dateLabel && (
                  <>
                    <span className="activity-article-modal__dot" aria-hidden="true">
                      ·
                    </span>
                    <time className="activity-article-modal__date">{activity.dateLabel}</time>
                  </>
                )}
              </div>
              <h2 className="activity-article-modal__title">{activity.title}</h2>
              {lead && <p className="activity-article-modal__lead">{lead}</p>}
            </header>

            <div className="activity-article-modal__body">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
