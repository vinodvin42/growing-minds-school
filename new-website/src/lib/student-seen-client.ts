import type { StudentNotificationSection } from "@/types/student-notifications";
import { sectionForNotificationKind, type StudentNotificationKind } from "@/types/student-notifications";

const STORAGE_PREFIX = "gms_student_seen_";
const EPOCH = "1970-01-01T00:00:00.000Z";

export type StudentLastSeen = Record<StudentNotificationSection, string>;

const EMPTY_SEEN: StudentLastSeen = {
  homework: EPOCH,
  messages: EPOCH,
  fees: EPOCH,
  calendar: EPOCH,
};

function storageKey(studentId: string): string {
  return `${STORAGE_PREFIX}${studentId}`;
}

export function getStudentLastSeen(studentId: string): StudentLastSeen {
  if (typeof window === "undefined") return { ...EMPTY_SEEN };
  try {
    const raw = localStorage.getItem(storageKey(studentId));
    if (!raw) return { ...EMPTY_SEEN };
    const parsed = JSON.parse(raw) as Partial<StudentLastSeen>;
    return {
      homework: parsed.homework ?? EPOCH,
      messages: parsed.messages ?? EPOCH,
      fees: parsed.fees ?? EPOCH,
      calendar: parsed.calendar ?? EPOCH,
    };
  } catch {
    return { ...EMPTY_SEEN };
  }
}

export function markStudentSectionSeen(studentId: string, section: StudentNotificationSection): void {
  if (typeof window === "undefined") return;
  const current = getStudentLastSeen(studentId);
  current[section] = new Date().toISOString();
  try {
    localStorage.setItem(storageKey(studentId), JSON.stringify(current));
  } catch {
    /* ignore quota errors */
  }
}

export function isNotificationUnseen(
  timestamp: string,
  kind: StudentNotificationKind,
  lastSeen: StudentLastSeen
): boolean {
  const section = sectionForNotificationKind(kind);
  return timestamp > (lastSeen[section] ?? EPOCH);
}

export function clearStudentLastSeen(studentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(studentId));
  } catch {
    /* ignore */
  }
}
