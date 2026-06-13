/** Stored in JSON files — includes password hash (never sent to clients). */
export interface StudentRecord {
  id: string;
  loginId: string;
  passwordHash: string;
  name: string;
  standard: string;
  section?: string;
  rollNumber?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Safe student profile — API & portal UI */
export interface StudentProfile {
  id: string;
  loginId: string;
  name: string;
  standard: string;
  section?: string;
  rollNumber?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  active: boolean;
}

/** Admin editor row — password plain text only when creating/resetting */
export interface StudentAdminInput {
  id?: string;
  loginId: string;
  password?: string;
  name: string;
  standard: string;
  section?: string;
  rollNumber?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  active: boolean;
}

export interface StudentsRegistry {
  students: StudentRecord[];
}

export const STUDENT_STANDARDS = [
  "Nursery",
  "LKG",
  "UKG",
  "1st Standard",
  "2nd Standard",
  "3rd Standard",
  "4th Standard",
  "5th Standard",
  "6th Standard",
  "7th Standard",
  "8th Standard",
] as const;

/** Demo credentials used before admin saves real students (local / first deploy). */
export const DEFAULT_STUDENT_LOGIN_ID = "GMS2026001";
export const DEFAULT_STUDENT_PASSWORD = "student123";

export function toStudentProfile(record: StudentRecord): StudentProfile {
  return {
    id: record.id,
    loginId: record.loginId,
    name: record.name,
    standard: record.standard,
    section: record.section,
    rollNumber: record.rollNumber,
    parentName: record.parentName,
    parentPhone: record.parentPhone,
    parentEmail: record.parentEmail,
    active: record.active,
  };
}
