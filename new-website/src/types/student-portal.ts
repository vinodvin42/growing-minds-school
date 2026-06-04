import type { StudentProfile } from "@/types/student";

export interface PortalAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

export type PortalAudience = "all" | "standard" | "individual";

export interface HomeworkItem {
  id: string;
  title: string;
  description: string;
  audience: PortalAudience;
  standard?: string;
  section?: string;
  targetStudentIds?: string[];
  attachments: PortalAttachment[];
  dueDateLabel?: string;
  active: boolean;
  createdAt: string;
}

export interface TeacherMessage {
  id: string;
  kind: "broadcast" | "individual";
  title: string;
  body: string;
  audience: PortalAudience;
  standard?: string;
  section?: string;
  targetStudentIds?: string[];
  attachments: PortalAttachment[];
  active: boolean;
  createdAt: string;
}

export interface StudentPortalData {
  homework: HomeworkItem[];
  messages: TeacherMessage[];
}

export function matchesStudentAudience(
  item: {
    audience: PortalAudience;
    standard?: string;
    section?: string;
    targetStudentIds?: string[];
    active?: boolean;
  },
  student: StudentProfile
): boolean {
  if (item.active === false) return false;

  if (item.audience === "individual") {
    return item.targetStudentIds?.includes(student.id) ?? false;
  }

  if (item.audience === "standard") {
    if (item.standard && item.standard !== "All" && item.standard !== student.standard) return false;
    if (item.section?.trim() && item.section.trim() !== (student.section?.trim() ?? "")) return false;
    return true;
  }

  // all students
  return true;
}

export function attachmentIcon(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "fa-file-pdf";
  if (/\.(jpg|jpeg|png|gif|webp)$/.test(lower)) return "fa-file-image";
  if (/\.(doc|docx)$/.test(lower)) return "fa-file-word";
  return "fa-file-alt";
}
