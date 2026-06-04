"use client";

import { useEffect, useState } from "react";
import PortalAttachments from "@/components/student/PortalAttachments";
import type { TeacherMessage } from "@/types/student-portal";

export default function StudentMessagesList() {
  const [items, setItems] = useState<TeacherMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/portal", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setItems(data.messages ?? []);
        else setError(data.message || "Could not load messages");
      })
      .catch(() => setError("Could not load messages"))
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
          📢
        </span>
        <p className="text-muted mb-0">No messages from teachers yet.</p>
      </div>
    );
  }

  return (
    <div className="portal-feed">
      {items.map((item) => (
        <article key={item.id} className="portal-feed-card">
          <div className="portal-feed-card__head">
            <span className={`portal-feed-card__tag ${item.kind === "individual" ? "portal-feed-card__tag--ind" : ""}`}>
              {item.kind === "individual" ? "For you" : "Broadcast"}
            </span>
            <h2 className="h5 fw-bold mb-1">{item.title}</h2>
          </div>
          <p className="portal-feed-card__body">{item.body}</p>
          <PortalAttachments attachments={item.attachments} />
        </article>
      ))}
    </div>
  );
}
