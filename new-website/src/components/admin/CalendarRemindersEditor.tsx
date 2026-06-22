"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminBadge,
  AdminCellText,
  AdminCollapsibleSection,
  AdminEditModal,
  AdminTable,
  AdminTableActions,
  AdminFloatingSaveBar,
} from "@/components/admin/AdminListUi";
import { PortalTargetingFields, audienceLabel } from "@/components/admin/PortalTargetingFields";
import {
  calendarUid,
  formatCalendarDate,
  formatCalendarDateRange,
  HOLIDAY_TYPES,
  holidayTypeLabel,
  REMINDER_KINDS,
  reminderKindMeta,
  type HolidayItem,
  type PortalReminder,
  type StudentCalendarData,
} from "@/types/student-calendar";
import type { StudentProfile } from "@/types/student";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
    </div>
  );
}

function emptyHoliday(): HolidayItem {
  return {
    id: calendarUid("hol"),
    title: "",
    description: "",
    type: "holiday",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    active: true,
    createdAt: new Date().toISOString(),
  };
}

function emptyReminder(): PortalReminder {
  return {
    id: calendarUid("rem"),
    kind: "general",
    title: "",
    body: "",
    eventDate: new Date().toISOString().slice(0, 10),
    audience: "all",
    standard: "All",
    section: "",
    targetStudentIds: [],
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export default function CalendarRemindersEditor() {
  const router = useRouter();
  const [data, setData] = useState<StudentCalendarData>({ holidays: [], reminders: [] });
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const [calRes, studentsRes] = await Promise.all([
      fetch("/api/admin/student-calendar", { cache: "no-store" }),
      fetch("/api/admin/students", { cache: "no-store" }),
    ]);
    if (calRes.status === 401) {
      router.push("/admin/login");
      return;
    }
    const calData = await calRes.json();
    if (calData.success) {
      setData({ holidays: calData.holidays ?? [], reminders: calData.reminders ?? [] });
      setAcademicYear(calData.academicYear ?? String(new Date().getFullYear()));
      setDirty(false);
    }
    const studentsData = await studentsRes.json();
    if (studentsData.success) setStudents(studentsData.students ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(next?: StudentCalendarData) {
    const payload = next ?? data;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/student-calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setData({ holidays: result.holidays ?? [], reminders: result.reminders ?? [] });
        setStatus("Calendar saved!");
        setDirty(false);
        return true;
      }
      setStatus(result.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const editingHoliday = data.holidays.find((h) => h.id === editingHolidayId);
  const editingReminder = data.reminders.find((r) => r.id === editingReminderId);

  function patchHoliday(id: string, patch: Partial<HolidayItem>) {
    setDirty(true);
    setData((d) => ({
      ...d,
      holidays: d.holidays.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }));
  }

  function patchReminder(id: string, patch: Partial<PortalReminder>) {
    setDirty(true);
    setData((d) => ({
      ...d,
      reminders: d.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-orange" role="status" />
      </div>
    );
  }

  return (
    <>
      <AdminCollapsibleSection
        title="Holiday Calendar"
        hint={`School holidays & events for ${academicYear}. Saved in portal/${academicYear}/calendar/holidays.json`}
        count={data.holidays.length}
        addLabel="Add Holiday"
        onAdd={() => {
          setDirty(true);
          const item = emptyHoliday();
          setData((d) => ({ ...d, holidays: [item, ...d.holidays] }));
          setEditingHolidayId(item.id);
        }}
        defaultOpen
      >
        {data.holidays.length === 0 ? (
          <div className="admin-empty-list">
            <i className="fas fa-calendar-alt d-block" />
            <p className="mb-0">No holidays added yet. Add Diwali break, summer vacation, etc.</p>
          </div>
        ) : (
          <AdminTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Dates</th>
                <th>Type</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.holidays.map((h) => (
                <tr key={h.id}>
                  <AdminCellText primary={h.title || "Untitled"} secondary={h.description} />
                  <td>{formatCalendarDateRange(h)}</td>
                  <td>{holidayTypeLabel(h.type)}</td>
                  <td>
                    <AdminBadge tone={h.active ? "success" : "muted"}>{h.active ? "Visible" : "Hidden"}</AdminBadge>
                  </td>
                  <AdminTableActions
                    onEdit={() => setEditingHolidayId(h.id)}
                    onDelete={() => {
                      setDirty(true);
                      setData((d) => ({ ...d, holidays: d.holidays.filter((x) => x.id !== h.id) }));
                      if (editingHolidayId === h.id) setEditingHolidayId(null);
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCollapsibleSection>

      <AdminCollapsibleSection
        title="Reminders"
        hint="Fees due, homework deadlines, PTM dates — targeted like messages. portal/{year}/calendar/reminders.json"
        count={data.reminders.length}
        addLabel="Add Reminder"
        onAdd={() => {
          setDirty(true);
          const item = emptyReminder();
          setData((d) => ({ ...d, reminders: [item, ...d.reminders] }));
          setEditingReminderId(item.id);
        }}
        defaultOpen
      >
        {data.reminders.length === 0 ? (
          <div className="admin-empty-list">
            <i className="fas fa-bell d-block" />
            <p className="mb-0">No reminders yet. Add fee due dates, PTM, or homework alerts.</p>
          </div>
        ) : (
          <AdminTable>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Kind</th>
                <th>Audience</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.reminders.map((r) => (
                <tr key={r.id}>
                  <AdminCellText primary={r.title || "Untitled"} secondary={r.body} />
                  <td>{formatCalendarDate(r.eventDate)}</td>
                  <td>{reminderKindMeta(r.kind).label}</td>
                  <td>{audienceLabel(r)}</td>
                  <td>
                    <AdminBadge tone={r.active ? "success" : "muted"}>{r.active ? "Active" : "Hidden"}</AdminBadge>
                  </td>
                  <AdminTableActions
                    onEdit={() => setEditingReminderId(r.id)}
                    onDelete={() => {
                      setDirty(true);
                      setData((d) => ({ ...d, reminders: d.reminders.filter((x) => x.id !== r.id) }));
                      if (editingReminderId === r.id) setEditingReminderId(null);
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </AdminTable>
        )}
      </AdminCollapsibleSection>

      <AdminFloatingSaveBar
        label="Save Calendar & Reminders"
        saving={saving}
        dirty={dirty}
        onSave={() => save()}
        status={status}
      />

      <AdminEditModal
        open={!!editingHoliday}
        title={editingHoliday?.title ? `Holiday: ${editingHoliday.title}` : "Add Holiday"}
        onClose={() => setEditingHolidayId(null)}
        onDelete={
          editingHoliday
            ? () => {
                setDirty(true);
                setData((d) => ({ ...d, holidays: d.holidays.filter((h) => h.id !== editingHoliday.id) }));
                setEditingHolidayId(null);
              }
            : undefined
        }
        footer={
          <button
            type="button"
            className="btn btn-orange"
            onClick={() => {
              setEditingHolidayId(null);
              setStatus("Saved locally. Click Save Calendar & Reminders to publish.");
            }}
          >
            Done
          </button>
        }
      >
        {editingHoliday && (
          <div className="row g-2">
            <div className="col-md-8">
              <Field label="Title *">
                <input
                  className="form-control"
                  value={editingHoliday.title}
                  onChange={(e) => patchHoliday(editingHoliday.id, { title: e.target.value })}
                  placeholder="e.g. Diwali Vacation"
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Type">
                <select
                  className="form-select"
                  value={editingHoliday.type}
                  onChange={(e) => patchHoliday(editingHoliday.id, { type: e.target.value as HolidayItem["type"] })}
                >
                  {HOLIDAY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Start date *">
                <input
                  type="date"
                  className="form-control admin-date-input"
                  value={editingHoliday.startDate}
                  onChange={(e) => patchHoliday(editingHoliday.id, { startDate: e.target.value })}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="End date (optional)">
                <input
                  type="date"
                  className="form-control admin-date-input"
                  value={editingHoliday.endDate ?? ""}
                  onChange={(e) => patchHoliday(editingHoliday.id, { endDate: e.target.value || undefined })}
                />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Description">
                <textarea
                  className="form-control"
                  rows={3}
                  value={editingHoliday.description ?? ""}
                  onChange={(e) => patchHoliday(editingHoliday.id, { description: e.target.value })}
                  placeholder="Optional note for students and parents"
                />
              </Field>
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={editingHoliday.active}
                  onChange={(e) => patchHoliday(editingHoliday.id, { active: e.target.checked })}
                  id={`hol-active-${editingHoliday.id}`}
                />
                <label className="form-check-label" htmlFor={`hol-active-${editingHoliday.id}`}>
                  Visible to students
                </label>
              </div>
            </div>
          </div>
        )}
      </AdminEditModal>

      <AdminEditModal
        open={!!editingReminder}
        title={editingReminder?.title ? `Reminder: ${editingReminder.title}` : "Add Reminder"}
        onClose={() => setEditingReminderId(null)}
        onDelete={
          editingReminder
            ? () => {
                setDirty(true);
                setData((d) => ({ ...d, reminders: d.reminders.filter((r) => r.id !== editingReminder.id) }));
                setEditingReminderId(null);
              }
            : undefined
        }
        size="lg"
        footer={
          <button
            type="button"
            className="btn btn-orange"
            onClick={() => {
              setEditingHolidayId(null);
              setStatus("Saved locally. Click Save Calendar & Reminders to publish.");
            }}
          >
            Done
          </button>
        }
      >
        {editingReminder && (
          <div className="row g-2">
            <div className="col-md-5">
              <Field label="Reminder type">
                <select
                  className="form-select"
                  value={editingReminder.kind}
                  onChange={(e) =>
                    patchReminder(editingReminder.id, { kind: e.target.value as PortalReminder["kind"] })
                  }
                >
                  {REMINDER_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="col-md-7">
              <Field label="Event / due date *">
                <input
                  type="date"
                  className="form-control admin-date-input"
                  value={editingReminder.eventDate}
                  onChange={(e) => patchReminder(editingReminder.id, { eventDate: e.target.value })}
                />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Title *">
                <input
                  className="form-control"
                  value={editingReminder.title}
                  onChange={(e) => patchReminder(editingReminder.id, { title: e.target.value })}
                  placeholder="e.g. Term 1 fees due / PTM for 3rd Standard"
                />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Message">
                <textarea
                  className="form-control"
                  rows={3}
                  value={editingReminder.body}
                  onChange={(e) => patchReminder(editingReminder.id, { body: e.target.value })}
                  placeholder="Details shown to students and parents"
                />
              </Field>
            </div>
            <PortalTargetingFields
              audience={editingReminder.audience}
              standard={editingReminder.standard}
              section={editingReminder.section}
              targetStudentIds={editingReminder.targetStudentIds}
              students={students}
              onChange={(p) => patchReminder(editingReminder.id, p)}
            />
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={editingReminder.active}
                  onChange={(e) => patchReminder(editingReminder.id, { active: e.target.checked })}
                  id={`rem-active-${editingReminder.id}`}
                />
                <label className="form-check-label" htmlFor={`rem-active-${editingReminder.id}`}>
                  Active reminder
                </label>
              </div>
            </div>
          </div>
        )}
      </AdminEditModal>
    </>
  );
}
