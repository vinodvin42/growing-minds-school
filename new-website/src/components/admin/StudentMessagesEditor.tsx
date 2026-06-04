"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminBadge,
  AdminCellText,
  AdminEditModal,
  AdminListHeader,
  AdminTable,
  AdminTableActions,
} from "@/components/admin/AdminListUi";
import {
  AttachmentUploader,
  PortalTargetingFields,
  audienceLabel,
  portalUid,
} from "@/components/admin/PortalTargetingFields";
import type { StudentPortalData, TeacherMessage } from "@/types/student-portal";
import type { StudentProfile } from "@/types/student";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
    </div>
  );
}

function emptyMessage(): TeacherMessage {
  return {
    id: portalUid(),
    kind: "broadcast",
    title: "",
    body: "",
    audience: "all",
    standard: "All",
    section: "",
    targetStudentIds: [],
    attachments: [],
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export default function StudentMessagesEditor({ uploadFile }: { uploadFile: (f: File) => Promise<string | null> }) {
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
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setPortal({ homework: data.homework ?? [], messages: data.messages ?? [] });
        setStatus("Messages saved!");
        return true;
      }
      setStatus(data.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const editing = portal.messages.find((m) => m.id === editingId);

  function patch(id: string, patchData: Partial<TeacherMessage>) {
    setPortal((p) => ({
      ...p,
      messages: p.messages.map((m) => {
        if (m.id !== id) return m;
        const next = { ...m, ...patchData };
        if (patchData.audience === "individual") next.kind = "individual";
        else if (patchData.audience !== undefined) next.kind = "broadcast";
        return next;
      }),
    }));
  }

  function addItem() {
    const item = emptyMessage();
    setPortal((p) => ({ ...p, messages: [item, ...p.messages] }));
    setEditingId(item.id);
  }

  function removeItem(id: string) {
    setPortal((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== id) }));
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
      <AdminListHeader
        title="Teacher Messages"
        hint="Broadcast notices to a class or send individual messages with PDF/files attached."
        count={portal.messages.length}
        addLabel="New Message"
        onAdd={addItem}
      />
      {portal.messages.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-bullhorn d-block" />
          <p className="mb-0">No messages yet.</p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Audience</th>
              <th>Files</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {portal.messages.map((m) => (
              <tr key={m.id}>
                <AdminCellText primary={m.title || "Untitled"} secondary={m.body} />
                <td>
                  <AdminBadge tone={m.kind === "individual" ? "warning" : "default"}>
                    {m.kind === "individual" ? "Individual" : "Broadcast"}
                  </AdminBadge>
                </td>
                <td>{audienceLabel(m)}</td>
                <td>{m.attachments.length}</td>
                <td>
                  <AdminBadge tone={m.active ? "success" : "muted"}>{m.active ? "Active" : "Hidden"}</AdminBadge>
                </td>
                <AdminTableActions onEdit={() => setEditingId(m.id)} onDelete={() => removeItem(m.id)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      <div className="d-flex align-items-center gap-3 mt-3">
        <button type="button" className="btn btn-orange" disabled={saving} onClick={() => save()}>
          {saving ? "Saving…" : "Save All Messages"}
        </button>
        {status && <span className="small text-muted">{status}</span>}
      </div>

      <AdminEditModal
        open={!!editing}
        title={editing?.title ? `Message: ${editing.title}` : "New Message"}
        onClose={() => setEditingId(null)}
        onDelete={editing ? () => removeItem(editing.id) : undefined}
        size="xl"
        footer={
          <button type="button" className="btn btn-orange" disabled={saving} onClick={() => save()}>
            {saving ? "Saving…" : "Save Messages"}
          </button>
        }
      >
        {editing && (
          <div className="row g-2">
            <div className="col-12">
              <Field label="Message type">
                <select
                  className="form-select"
                  value={editing.kind}
                  onChange={(e) => {
                    const kind = e.target.value as TeacherMessage["kind"];
                    patch(editing.id, {
                      kind,
                      audience: kind === "individual" ? "individual" : "all",
                    });
                  }}
                >
                  <option value="broadcast">Broadcast (class or all)</option>
                  <option value="individual">Individual message</option>
                </select>
              </Field>
            </div>
            <div className="col-12">
              <Field label="Title *">
                <input className="form-control" value={editing.title} onChange={(e) => patch(editing.id, { title: e.target.value })} />
              </Field>
            </div>
            <div className="col-12">
              <Field label="Message *">
                <textarea className="form-control" rows={5} value={editing.body} onChange={(e) => patch(editing.id, { body: e.target.value })} />
              </Field>
            </div>
            <PortalTargetingFields
              audience={editing.kind === "individual" ? "individual" : editing.audience}
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
                  id={`msg-active-${editing.id}`}
                />
                <label className="form-check-label" htmlFor={`msg-active-${editing.id}`}>
                  Send / visible to students
                </label>
              </div>
            </div>
          </div>
        )}
      </AdminEditModal>
    </>
  );
}
