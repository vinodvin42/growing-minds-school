import { get, put } from "@vercel/blob";
import { hashPassword } from "@/lib/password";
import { blobStorageErrorMessage, blobAccess, isBlobStorageConfigured } from "@/lib/blob-storage";
import type { StudentAdminInput, StudentRecord, StudentsRegistry } from "@/types/student";
import { DEFAULT_STUDENT_LOGIN_ID, DEFAULT_STUDENT_PASSWORD } from "@/types/student";

export const STUDENTS_BLOB_PATH = "students-registry.json";

const DEFAULT_LOGIN_ID = DEFAULT_STUDENT_LOGIN_ID;
const DEFAULT_PASSWORD = DEFAULT_STUDENT_PASSWORD;

async function buildDefaultRegistry(): Promise<StudentsRegistry> {
  const now = new Date().toISOString();
  return {
    students: [
      {
        id: "demo-student-1",
        loginId: DEFAULT_LOGIN_ID,
        passwordHash: await hashPassword(DEFAULT_PASSWORD),
        name: "Demo Student",
        standard: "3rd Standard",
        section: "A",
        rollNumber: "12",
        parentName: "Demo Parent",
        parentPhone: "+91 98765 43210",
        parentEmail: "",
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export async function getStudentsRegistry(): Promise<StudentsRegistry> {
  if (!isBlobStorageConfigured()) {
    return buildDefaultRegistry();
  }

  try {
    const result = await get(STUDENTS_BLOB_PATH, { access: blobAccess() });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return buildDefaultRegistry();
    }
    const text = await new Response(result.stream).text();
    if (!text.trim()) return buildDefaultRegistry();
    const data = JSON.parse(text) as StudentsRegistry;
    if (!Array.isArray(data.students)) return buildDefaultRegistry();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("not found")) {
      return buildDefaultRegistry();
    }
    console.error("Failed to load students registry:", error);
    return buildDefaultRegistry();
  }
}

export async function saveStudentsRegistry(registry: StudentsRegistry): Promise<void> {
  if (!isBlobStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  await put(STUDENTS_BLOB_PATH, JSON.stringify(registry, null, 2), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function findStudentByLoginId(loginId: string): Promise<StudentRecord | null> {
  const normalized = loginId.trim().toLowerCase();
  const { students } = await getStudentsRegistry();
  return students.find((s) => s.loginId.trim().toLowerCase() === normalized) ?? null;
}

export async function findStudentById(id: string): Promise<StudentRecord | null> {
  const { students } = await getStudentsRegistry();
  return students.find((s) => s.id === id) ?? null;
}

function uid() {
  return `stu_${Math.random().toString(36).slice(2, 11)}`;
}

export async function mergeStudentInputs(
  existing: StudentRecord[],
  inputs: StudentAdminInput[]
): Promise<StudentRecord[]> {
  const byId = new Map(existing.map((s) => [s.id, s]));
  const now = new Date().toISOString();
  const next: StudentRecord[] = [];

  for (const input of inputs) {
    const id = input.id || uid();
    const prev = input.id ? byId.get(input.id) : undefined;
    const loginId = input.loginId.trim();

    if (!loginId || !input.name.trim()) continue;

    let passwordHash = prev?.passwordHash ?? "";
    if (input.password?.trim()) {
      passwordHash = await hashPassword(input.password.trim());
    } else if (!passwordHash) {
      passwordHash = await hashPassword(DEFAULT_PASSWORD);
    }

    next.push({
      id,
      loginId,
      passwordHash,
      name: input.name.trim(),
      standard: input.standard,
      section: input.section?.trim() || undefined,
      rollNumber: input.rollNumber?.trim() || undefined,
      parentName: input.parentName.trim(),
      parentPhone: input.parentPhone.trim(),
      parentEmail: input.parentEmail?.trim() || undefined,
      active: input.active,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    });
  }

  return next;
}
