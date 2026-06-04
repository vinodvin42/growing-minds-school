"use client";

import { useEffect, useState } from "react";
import PortalAttachments from "@/components/student/PortalAttachments";
import { useMarkSectionSeen } from "@/components/student/StudentNotificationProvider";
import { homeworkDueDisplay, type HomeworkItem } from "@/types/student-portal";

export default function StudentHomeworkList() {
  useMarkSectionSeen("homework");
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/portal", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setItems(data.homework ?? []);
        else setError(data.message || "Could not load homework");
      })
      .catch(() => setError("Could not load homework"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-orange" role="status" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="portal-empty text-center py-5">
        <span className="portal-empty__icon" aria-hidden="true">
          📚
        </span>
        <p className="text-muted mb-0">No homework right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="portal-feed">
      {items.map((item) => (
        <article key={item.id} className="portal-feed-card">
          <div className="portal-feed-card__head">
            <h2 className="h5 fw-bold mb-1">{item.title}</h2>
            {homeworkDueDisplay(item) && (
              <span className="portal-feed-card__due">
                <i className="fas fa-clock me-1" aria-hidden="true" />
                Due: {homeworkDueDisplay(item)}
              </span>
            )}
          </div>
          {item.description && <p className="portal-feed-card__body">{item.description}</p>}
          <PortalAttachments attachments={item.attachments} />
        </article>
      ))}
    </div>
  );
}
