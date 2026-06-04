"use client";

import type { PortalAudience } from "@/types/student-portal";
import { STUDENT_STANDARDS, type StudentProfile } from "@/types/student";

export function audienceLabel(item: {
  audience: PortalAudience;
  standard?: string;
  section?: string;
  targetStudentIds?: string[];
}) {
  if (item.audience === "all") return "All students";
  if (item.audience === "individual") return `Individual (${item.targetStudentIds?.length ?? 0})`;
  const parts = [item.standard || "Standard"];
  if (item.section) parts.push(`Sec ${item.section}`);
  return parts.join(" · ");
}

export function PortalTargetingFields({
  audience,
  standard,
  section,
  targetStudentIds,
  students,
  onChange,
}: {
  audience: PortalAudience;
  standard?: string;
  section?: string;
  targetStudentIds?: string[];
  students: StudentProfile[];
  onChange: (patch: {
    audience?: PortalAudience;
    standard?: string;
    section?: string;
    targetStudentIds?: string[];
  }) => void;
}) {
  return (
    <>
      <div className="col-md-6">
        <label className="admin-field__label">Send to</label>
        <select
          className="form-select"
          value={audience}
          onChange={(e) =>
            onChange({
              audience: e.target.value as PortalAudience,
              targetStudentIds: e.target.value === "individual" ? targetStudentIds ?? [] : [],
            })
          }
        >
          <option value="all">All students</option>
          <option value="standard">By standard / section</option>
          <option value="individual">Individual students</option>
        </select>
      </div>

      {audience === "standard" && (
        <>
          <div className="col-md-3">
            <label className="admin-field__label">Standard</label>
            <select className="form-select" value={standard ?? "All"} onChange={(e) => onChange({ standard: e.target.value })}>
              <option value="All">All standards</option>
              {STUDENT_STANDARDS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="admin-field__label">Section (optional)</label>
            <input className="form-control" value={section ?? ""} onChange={(e) => onChange({ section: e.target.value })} placeholder="A" />
          </div>
        </>
      )}

      {audience === "individual" && (
        <div className="col-12">
          <label className="admin-field__label">Select students</label>
          <div className="portal-student-pick">
            {students.length === 0 ? (
              <p className="small text-muted mb-0">Add students in the Students (App) tab first.</p>
            ) : (
              students.map((s) => {
                const checked = targetStudentIds?.includes(s.id) ?? false;
                return (
                  <label key={s.id} className="portal-student-pick__item">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const set = new Set(targetStudentIds ?? []);
                        if (e.target.checked) set.add(s.id);
                        else set.delete(s.id);
                        onChange({ targetStudentIds: [...set] });
                      }}
                    />
                    <span>
                      {s.name} <span className="text-muted">({s.loginId})</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function AttachmentUploader({
  attachments,
  onAdd,
  onRemove,
  uploadFile,
}: {
  attachments: { id: string; fileName: string; fileUrl: string }[];
  onAdd: (file: { fileName: string; fileUrl: string }) => void;
  onRemove: (id: string) => void;
  uploadFile: (file: File) => Promise<string | null>;
}) {
  return (
    <div className="col-12">
      <label className="admin-field__label">Attachments (PDF, images, documents)</label>
      <input
        type="file"
        className="form-control mb-2"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = await uploadFile(file);
          if (url) onAdd({ fileName: file.name, fileUrl: url });
          e.target.value = "";
        }}
      />
      {attachments.length > 0 && (
        <ul className="list-group list-group-flush border rounded">
          {attachments.map((a) => (
            <li key={a.id} className="list-group-item d-flex align-items-center justify-content-between py-2">
              <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="small text-truncate me-2">
                {a.fileName}
              </a>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onRemove(a.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export { uid as portalUid };
