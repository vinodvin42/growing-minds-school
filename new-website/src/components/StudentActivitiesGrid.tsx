"use client";

import { useMemo, useState } from "react";
import type { StudentActivity } from "@/types/content";
import { ACTIVITY_CATEGORIES, activityColorClass, activityEmoji } from "@/lib/activities";
import ActivityArticleModal from "@/components/ActivityArticleModal";

export default function StudentActivitiesGrid({ activities }: { activities: StudentActivity[] }) {
  const [active, setActive] = useState<StudentActivity | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const fromItems = activities.map((a) => a.category?.trim()).filter(Boolean) as string[];
    const unique = [...new Set([...ACTIVITY_CATEGORIES, ...fromItems])];
    return ["All", ...unique];
  }, [activities]);

  const filtered = useMemo(() => {
    if (filter === "All") return activities;
    return activities.filter((a) => (a.category || "Other") === filter);
  }, [activities, filter]);

  if (activities.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <span className="activity-empty-icon" aria-hidden="true">
          🎨
        </span>
        <p>No activities to showcase yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="activity-filters mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`activity-filter-btn ${filter === cat ? "is-active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "All" ? "All Activities" : `${activityEmoji(cat)} ${cat}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <p className="mb-0">No activities in this category yet.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((activity) => (
            <div key={activity.id} className="col-md-6 col-lg-4">
              <button
                type="button"
                className={`activity-card w-100 border-0 text-start ${activityColorClass(activity.category)}`}
                onClick={() => setActive(activity)}
              >
                <div className="activity-card__image-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={activity.imageUrl} alt={activity.alt} className="activity-card__image" />
                  <span className="activity-card__emoji" aria-hidden="true">
                    {activityEmoji(activity.category)}
                  </span>
                </div>
                <div className="activity-card__body">
                  <div className="activity-card__meta">
                    <span className="activity-card__badge">{activity.category}</span>
                    {activity.dateLabel && <span className="activity-card__date">{activity.dateLabel}</span>}
                  </div>
                  <h3 className="activity-card__title">{activity.title}</h3>
                  <p className="activity-card__desc">{activity.description}</p>
                  <span className="activity-card__view">
                    <i className="fas fa-eye activity-card__view-icon" aria-hidden="true" />
                    View Details
                    <i className="fas fa-arrow-right activity-card__view-arrow" aria-hidden="true" />
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {active && <ActivityArticleModal activity={active} onClose={() => setActive(null)} />}
    </>
  );
}
