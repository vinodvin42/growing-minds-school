"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCalendarDate,
  formatCalendarDateRange,
  groupByMonth,
  holidayTypeLabel,
  reminderKindMeta,
  type HolidayItem,
  type PortalReminder,
} from "@/types/student-calendar";
import { useMarkSectionSeen } from "@/components/student/StudentNotificationProvider";

type CalendarResponse = {
  success: boolean;
  academicYear?: string;
  holidays?: HolidayItem[];
  reminders?: PortalReminder[];
};

function MonthMiniGrid({ holidays, month }: { holidays: HolidayItem[]; month: string }) {
  const [y, m] = month.split("-").map(Number);
  const firstDay = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startWeekday = firstDay.getDay();
  const holidayDates = new Set<string>();

  for (const h of holidays) {
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${month}-${String(d).padStart(2, "0")}`;
      const start = h.startDate;
      const end = h.endDate || h.startDate;
      if (iso >= start && iso <= end) holidayDates.add(iso);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="student-cal-grid" aria-label={`Calendar for ${month}`}>
      <div className="student-cal-grid__weekdays">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      <div className="student-cal-grid__days">
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} className="student-cal-grid__day student-cal-grid__day--empty" />;
          const iso = `${month}-${String(day).padStart(2, "0")}`;
          const isHoliday = holidayDates.has(iso);
          const isToday = iso === new Date().toISOString().slice(0, 10);
          return (
            <span
              key={iso}
              className={[
                "student-cal-grid__day",
                isHoliday ? "student-cal-grid__day--holiday" : "",
                isToday ? "student-cal-grid__day--today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function StudentCalendarView() {
  useMarkSectionSeen("calendar");
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"all" | "holidays" | "reminders">("all");

  useEffect(() => {
    fetch("/api/student/calendar", { cache: "no-store" })
      .then((r) => r.json())
      .then((res: CalendarResponse) => {
        if (res.success) setData(res);
        else setError("Could not load calendar");
      })
      .catch(() => setError("Could not load calendar"))
      .finally(() => setLoading(false));
  }, []);

  const holidays = data?.holidays ?? [];
  const reminders = data?.reminders ?? [];
  const holidayMonths = useMemo(() => groupByMonth(holidays, "startDate"), [holidays]);
  const reminderMonths = useMemo(() => groupByMonth(reminders, "eventDate"), [reminders]);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthHolidays = holidays.filter((h) => {
    const end = h.endDate || h.startDate;
    return h.startDate.slice(0, 7) <= currentMonth && end.slice(0, 7) >= currentMonth;
  });

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

  return (
    <div className="student-calendar">
      <div className="student-cal-tabs" role="tablist">
        {(
          [
            ["all", "All"],
            ["holidays", "Holidays"],
            ["reminders", "Reminders"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`student-cal-tabs__btn${tab === id ? " student-cal-tabs__btn--active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {(tab === "all" || tab === "holidays") && (
        <section className="student-cal-section">
          <h2 className="student-cal-section__title">
            <i className="fas fa-umbrella-beach me-2" aria-hidden="true" />
            Holidays {data?.academicYear ? `· ${data.academicYear}` : ""}
          </h2>

          {currentMonthHolidays.length > 0 && (
            <div className="student-cal-month-block">
              <h3 className="student-cal-month-block__title">This month</h3>
              <MonthMiniGrid holidays={currentMonthHolidays} month={currentMonth} />
            </div>
          )}

          {holidays.length === 0 ? (
            <p className="text-muted small mb-0">No holidays posted yet.</p>
          ) : (
            holidayMonths.map(({ month, label, items }) => (
              <div key={month} className="student-cal-month-block">
                <h3 className="student-cal-month-block__title">{label}</h3>
                <ul className="student-cal-list">
                  {items.map((item) => (
                    <li key={item.id} className={`student-cal-list__item student-cal-list__item--${item.type}`}>
                      <div className="student-cal-list__date">
                        <span className="student-cal-list__date-day">{item.startDate.slice(8, 10)}</span>
                        <span className="student-cal-list__date-mon">
                          {new Date(`${item.startDate}T12:00:00`).toLocaleDateString("en-IN", { month: "short" })}
                        </span>
                      </div>
                      <div className="student-cal-list__body">
                        <strong>{item.title}</strong>
                        <span className="student-cal-list__meta">
                          {holidayTypeLabel(item.type)} · {formatCalendarDateRange(item)}
                        </span>
                        {item.description?.trim() && <p className="student-cal-list__desc">{item.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      )}

      {(tab === "all" || tab === "reminders") && (
        <section className="student-cal-section">
          <h2 className="student-cal-section__title">
            <i className="fas fa-bell me-2" aria-hidden="true" />
            Reminders
          </h2>
          {reminders.length === 0 ? (
            <p className="text-muted small mb-0">No reminders right now.</p>
          ) : (
            reminderMonths.map(({ month, label, items }) => (
              <div key={month} className="student-cal-month-block">
                <h3 className="student-cal-month-block__title">{label}</h3>
                <ul className="student-cal-list">
                  {items.map((item) => {
                    const meta = reminderKindMeta(item.kind);
                    return (
                      <li key={item.id} className={`student-cal-list__item student-cal-list__item--rem-${item.kind}`}>
                        <div className={`student-cal-list__icon student-cal-list__icon--${item.kind}`}>
                          <i className={`fas ${meta.icon}`} aria-hidden="true" />
                        </div>
                        <div className="student-cal-list__body">
                          <strong>{item.title}</strong>
                          <span className="student-cal-list__meta">
                            {meta.label} · {formatCalendarDate(item.eventDate)}
                          </span>
                          {item.body?.trim() && <p className="student-cal-list__desc">{item.body}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

/** Compact upcoming list for dashboard */
export function StudentUpcomingCalendar({ limit = 4 }: { limit?: number }) {
  const [items, setItems] = useState<{ holidays: HolidayItem[]; reminders: PortalReminder[] }>({
    holidays: [],
    reminders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/calendar", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.upcoming) {
          setItems({
            holidays: (data.upcoming.holidays ?? []).slice(0, limit),
            reminders: (data.upcoming.reminders ?? []).slice(0, limit),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return null;

  const combined = [
    ...items.holidays.map((h) => ({
      id: h.id,
      kind: "holiday" as const,
      title: h.title,
      date: h.startDate,
      sub: holidayTypeLabel(h.type),
    })),
    ...items.reminders.map((r) => ({
      id: r.id,
      kind: r.kind,
      title: r.title,
      date: r.eventDate,
      sub: reminderKindMeta(r.kind).label,
    })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);

  if (combined.length === 0) return null;

  return (
    <section className="student-upcoming-cal">
      <h2 className="student-upcoming-cal__title">Coming up</h2>
      <ul className="student-upcoming-cal__list">
        {combined.map((item) => (
          <li key={`${item.kind}-${item.id}`} className={`student-upcoming-cal__item student-upcoming-cal__item--${item.kind}`}>
            <span className="student-upcoming-cal__date">{formatCalendarDate(item.date)}</span>
            <div>
              <strong>{item.title}</strong>
              <span className="student-upcoming-cal__sub">{item.sub}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
