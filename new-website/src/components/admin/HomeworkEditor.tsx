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
import {
  AttachmentUploader,
  PortalTargetingFields,
  audienceLabel,
  portalUid,
} from "@/components/admin/PortalTargetingFields";
import {
  formatHomeworkDueDate,
  homeworkDueDisplay,
  homeworkDueInputValue,
  type HomeworkItem,
  type StudentPortalData,
} from "@/types/student-portal";
import type { StudentProfile } from "@/types/student";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
    </div>
  );
}

function emptyHomework(): HomeworkItem {
  return {
    id: portalUid(),
    title: "",
    description: "",
    audience: "standard",
    standard: "All",
    section: "",
    targetStudentIds: [],
    attachments: [],
    dueDateLabel: "",
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export default function HomeworkEditor({ uploadFile }: { uploadFile: (f: File) => Promise<string | null> }) {
  const router = useRouter();
  const [portal, setPortal] = useState<StudentPortalData>({ homework: [], messages: [] });
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [portalRes, studentsRes] = await Promise.all([
      fetch("/api/admin/student-portal", { cache: "no-store" }),
      fetch("/api/admin/students", { cache: "no-store" }),
    ]);
    if (portalRes.status === 401) {
      router.push("/admin/login");
      return;
    }
    const portalData = await portalRes.json();
    if (portalData.success) {
      setPortal({ homework: portalData.homework ?? [], messages: portalData.messages ?? [] });
    }
    const studentsData = await studentsRes.json();
    if (studentsData.success) setStudents(studentsData.students ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(next?: StudentPortalData) {
    const payload = next ?? portal;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/student-portal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homework: payload.homework }),
      });
      const data = await res.json();
      if (data.success) {
        setPortal({ homework: data.homework ?? [], messages: data.messages ?? [] });
        setStatus("Homework saved!");
        return true;
      }
      setStatus(data.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const editing = portal.homework.find((h) => h.id === editingId);

  function patch(id: string, patchData: Partial<HomeworkItem>) {
    setPortal((p) => ({
      ...p,
      homework: p.homework.map((h) => (h.id === id ? { ...h, ...patchData } : h)),
    }));
  }

  function addItem() {
    const item = emptyHomework();
    setPortal((p) => ({ ...p, homework: [item, ...p.homework] }));
    setEditingId(item.id);
  }

  function removeItem(id: string) {
    setPortal((p) => ({ ...p, homework: p.homework.filter((h) => h.id !== id) }));
    if (editingId === id) setEditingId(null);
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
        title="Homework"
        hint="Saved class-wise in portal/2026/classes/3rd-standard/homework.json (by target class). All-school → all-classes folder."
        count={portal.homework.length}
        addLabel="Add Homework"
        onAdd={addItem}
        defaultOpen
      >
      {portal.homework.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-book d-block" />
          <p className="mb-0">No homework posted yet.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Audience</th>
              <th>Files</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {portal.homework.map((h) => (
              <tr key={h.id}>
                <AdminCellText primary={h.title || "Untitled"} secondary={h.description} />
                <td>{homeworkDueDisplay(h) || "—"}</td>
                <td>{audienceLabel(h)}</td>
                <td>{h.attachments.length}</td>
                <td>
                  <AdminBadge tone={h.active ? "success" : "muted"}>{h.active ? "Visible" : "Hidden"}</AdminBadge>
                </td>
                <AdminTableActions onEdit={() => setEditingId(h.id)} onDelete={() => removeItem(h.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>
      <AdminFloatingSaveBar
        label="Save All Homework"
        saving={saving}
        onSave={() => save()}
        status={status}
      />

      <AdminEditModal
        open={!!editing}
        title={editing?.title ? `Homework: ${editing.title}` : "Add Homework"}
        onClose={() => setEditingId(null)}
        onDelete={editing ? () => removeItem(editing.id) : undefined}
        size="xl"
        footer={
          <button type="button" className="btn btn-orange" disabled={saving} onClick={() => save()}>
            {saving ? "Saving…" : "Save Homework"}
          </button>
        }
      >
        {editing && (
          <div className="row g-2">
            <div className="col-md-8">
              <Field label="Title *">
                <input className="form-control" value={editing.title} onChange={(e) => patch(editing.id, { title: e.target.value })} />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Due date">
                <input
                  type="date"
                  className="form-control admin-date-input"
                  value={homeworkDueInputValue(editing)}
                  onChange={(e) => {
                    const value = e.target.value;
                    patch(editing.id, {
                      dueDate: value || undefined,
                      dueDateLabel: value ? formatHomeworkDueDate(value) : "",
                    });
                  }}
                />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Instructions">
                <textarea className="form-control" rows={4} value={editing.description} onChange={(e) => patch(editing.id, { description: e.target.value })} />
              </Field>
            </div>
            <PortalTargetingFields
              audience={editing.audience}
              standard={editing.standard}
              section={editing.section}
              targetStudentIds={editing.targetStudentIds}
              students={students}
              onChange={(p) => patch(editing.id, p)}
            />
            <AttachmentUploader
              attachments={editing.attachments}
              uploadFile={uploadFile}
              onAdd={({ fileName, fileUrl }) =>
                patch(editing.id, { attachments: [...editing.attachments, { id: portalUid(), fileName, fileUrl }] })
              }
              onRemove={(aid) => patch(editing.id, { attachments: editing.attachments.filter((a) => a.id !== aid) })}
            />
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => patch(editing.id, { active: e.target.checked })}
                  id={`hw-active-${editing.id}`}
                />
                <label className="form-check-label" htmlFor={`hw-active-${editing.id}`}>
                  Visible to students
                </label>
              </div>
            </div>
          </div>
        )}
      </AdminEditModal>
    </>
  );
}
