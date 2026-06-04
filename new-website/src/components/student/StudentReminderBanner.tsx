"use client";

import Link from "next/link";
import { notificationKindIcon, notificationKindLabel } from "@/types/student-notifications";
import { useStudentNotifications } from "@/components/student/StudentNotificationProvider";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function StudentReminderBanner() {
  const { unseen, counts, loading, bannerDismissed, dismissBanner } = useStudentNotifications();

  if (loading || counts.total === 0 || bannerDismissed) return null;

  const preview = unseen.slice(0, 4);

  return (
    <div className="student-reminder-banner" role="region" aria-label="New updates from school">
      <div className="student-reminder-banner__head">
        <div>
          <span className="student-reminder-banner__badge">{counts.total}</span>
          <strong className="student-reminder-banner__title">New from school</strong>
        </div>
        <button
          type="button"
          className="student-reminder-banner__close"
          onClick={dismissBanner}
          aria-label="Dismiss reminders for now"
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>
      <ul className="student-reminder-banner__list">
        {preview.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className="student-reminder-banner__item">
              <span className={`student-reminder-banner__icon student-reminder-banner__icon--${item.kind}`}>
                <i className={`fas ${notificationKindIcon(item.kind)}`} aria-hidden="true" />
              </span>
              <span className="student-reminder-banner__text">
                <span className="student-reminder-banner__kind">{notificationKindLabel(item.kind)}</span>
                <strong>{item.title}</strong>
                {item.subtitle && <span className="student-reminder-banner__sub">{item.subtitle}</span>}
              </span>
              <span className="student-reminder-banner__time">{timeAgo(item.timestamp)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {unseen.length > preview.length && (
        <p className="student-reminder-banner__more mb-0">
          +{unseen.length - preview.length} more — open the tabs below
        </p>
      )}
    </div>
  );
}
