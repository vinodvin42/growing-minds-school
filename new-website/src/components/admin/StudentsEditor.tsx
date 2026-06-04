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
} from "@/components/admin/AdminListUi";
import { STUDENT_STANDARDS, DEFAULT_STUDENT_LOGIN_ID, DEFAULT_STUDENT_PASSWORD, type StudentAdminInput, type StudentProfile } from "@/types/student";

function uid() {
  return `stu_${Math.random().toString(36).slice(2, 11)}`;
}

function emptyStudent(): StudentAdminInput {
  return {
    id: uid(),
    loginId: "",
    password: "",
    name: "",
    standard: "Nursery",
    section: "",
    rollNumber: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    active: true,
  };
}

function toInput(profile: StudentProfile): StudentAdminInput {
  return {
    id: profile.id,
    loginId: profile.loginId,
    name: profile.name,
    standard: profile.standard,
    section: profile.section ?? "",
    rollNumber: profile.rollNumber ?? "",
    parentName: profile.parentName,
    parentPhone: profile.parentPhone,
    parentEmail: profile.parentEmail ?? "",
    active: profile.active,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-field__label">{label}</label>
      {children}
    </div>
  );
}

export default function StudentsEditor() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentAdminInput[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/students", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    if (data.success) {
      setStudents((data.students as StudentProfile[]).map(toInput));
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(next?: StudentAdminInput[]) {
    const payload = next ?? students;
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((data.students as StudentProfile[]).map(toInput));
        setStatus("Students saved!");
        return true;
      }
      setStatus(data.message || "Save failed");
      return false;
    } finally {
      setSaving(false);
    }
  }

  const editing = students.find((s) => s.id === editingId);
  const isNew = editing && !editing.loginId && !editing.name;

  function patch(id: string, patchData: Partial<StudentAdminInput>) {
    setStudents((list) => list.map((s) => (s.id === id ? { ...s, ...patchData } : s)));
  }

  function addStudent() {
    const row = emptyStudent();
    setStudents((list) => [...list, row]);
    setEditingId(row.id!);
  }

  function removeStudent(id: string) {
    setStudents((list) => list.filter((s) => s.id !== id));
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
        title="Student Management"
        hint="Create student IDs and passwords for the student app. Save after adding or editing — students sign in at /student/login."
        count={students.length}
        addLabel="Add Student"
        onAdd={addStudent}
        defaultOpen
      >
      {students.length === 0 ? (
        <div className="admin-empty-list">
          <i className="fas fa-user-graduate d-block" />
          <p className="mb-2">No students yet. Add students to enable app login.</p>
          <p className="small text-muted mb-0">
            Until saved, demo login works locally: <code>{DEFAULT_STUDENT_LOGIN_ID}</code> / <code>{DEFAULT_STUDENT_PASSWORD}</code>
          </p>
        </div>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Login ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Parent</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <AdminCellText primary={s.loginId || "—"} secondary={s.rollNumber ? `Roll ${s.rollNumber}` : undefined} />
                <AdminCellText primary={s.name || "Unnamed"} />
                <td>
                  {s.standard}
                  {s.section ? ` · ${s.section}` : ""}
                </td>
                <AdminCellText primary={s.parentName || "—"} secondary={s.parentPhone} />
                <td>
                  <AdminBadge tone={s.active ? "success" : "muted"}>{s.active ? "Active" : "Inactive"}</AdminBadge>
                </td>
                <AdminTableActions onEdit={() => setEditingId(s.id!)} onDelete={() => removeStudent(s.id!)} />
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}
      </AdminCollapsibleSection>
      <div className="d-flex align-items-center gap-3 mt-3">
        <button type="button" className="btn btn-orange" disabled={saving} onClick={() => save()}>
          {saving ? "Saving…" : "Save All Students"}
        </button>
        {status && <span className="small text-muted">{status}</span>}
      </div>

      <AdminEditModal
        open={!!editing}
        title={isNew ? "Add Student" : `Edit: ${editing?.name || editing?.loginId || "Student"}`}
        onClose={() => setEditingId(null)}
        onDelete={editing ? () => removeStudent(editing.id!) : undefined}
        footer={
          <button
            type="button"
            className="btn btn-orange"
            disabled={saving}
            onClick={async () => {
              const ok = await save();
              if (ok) setEditingId(null);
            }}
          >
            {saving ? "Saving…" : "Save Students"}
          </button>
        }
      >
        {editing && (
          <>
            <p className="admin-hint mb-3">
              Demo login (until you save new students): ID <code>{DEFAULT_STUDENT_LOGIN_ID}</code> / password{" "}
              <code>{DEFAULT_STUDENT_PASSWORD}</code>
            </p>
            <div className="row g-2">
              <div className="col-md-6">
                <Field label="Student ID (login username) *">
                  <input
                    className="form-control"
                    value={editing.loginId}
                    onChange={(e) => patch(editing.id!, { loginId: e.target.value })}
                    placeholder="GMS2026001"
                  />
                </Field>
              </div>
              <div className="col-md-6">
                <Field label="Password (leave blank to keep current)">
                  <input
                    type="password"
                    className="form-control"
                    value={editing.password ?? ""}
                    onChange={(e) => patch(editing.id!, { password: e.target.value })}
                    placeholder="Set or reset password"
                  />
                </Field>
              </div>
              <div className="col-md-6">
                <Field label="Full Name *">
                  <input className="form-control" value={editing.name} onChange={(e) => patch(editing.id!, { name: e.target.value })} />
                </Field>
              </div>
              <div className="col-md-3">
                <Field label="Standard">
                  <select className="form-select" value={editing.standard} onChange={(e) => patch(editing.id!, { standard: e.target.value })}>
                    {STUDENT_STANDARDS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="col-md-3">
                <Field label="Section">
                  <input className="form-control" value={editing.section ?? ""} onChange={(e) => patch(editing.id!, { section: e.target.value })} placeholder="A" />
                </Field>
              </div>
              <div className="col-md-4">
                <Field label="Roll Number">
                  <input className="form-control" value={editing.rollNumber ?? ""} onChange={(e) => patch(editing.id!, { rollNumber: e.target.value })} />
                </Field>
              </div>
              <div className="col-md-8">
                <Field label="Parent / Guardian Name *">
                  <input className="form-control" value={editing.parentName} onChange={(e) => patch(editing.id!, { parentName: e.target.value })} />
                </Field>
              </div>
              <div className="col-md-6">
                <Field label="Parent Phone *">
                  <input className="form-control" value={editing.parentPhone} onChange={(e) => patch(editing.id!, { parentPhone: e.target.value })} />
                </Field>
              </div>
              <div className="col-md-6">
                <Field label="Parent Email">
                  <input type="email" className="form-control" value={editing.parentEmail ?? ""} onChange={(e) => patch(editing.id!, { parentEmail: e.target.value })} />
                </Field>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={editing.active}
                    onChange={(e) => patch(editing.id!, { active: e.target.checked })}
                    id={`student-active-${editing.id}`}
                  />
                  <label className="form-check-label" htmlFor={`student-active-${editing.id}`}>
                    Active (can sign in to student app)
                  </label>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminEditModal>
    </>
  );
}
