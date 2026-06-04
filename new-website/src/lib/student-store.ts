import { unstable_noStore as noStore } from "next/cache";
import { listBlobPathnames, readBlobJson, writeBlobJson } from "@/lib/blob-json";
import { readBlobJsonText } from "@/lib/blob-read";
import { hashPassword } from "@/lib/password";
import {
  academicYear,
  classSlug,
  classStudentsBlobPath,
  LEGACY_STUDENTS_BLOB_PATH,
  PORTAL_ROOT,
  parseClassSlugFromStudentsPath,
} from "@/lib/portal-storage-paths";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";
import type { StudentAdminInput, StudentRecord, StudentsRegistry } from "@/types/student";
import { DEFAULT_STUDENT_LOGIN_ID, DEFAULT_STUDENT_PASSWORD } from "@/types/student";

const DEFAULT_LOGIN_ID = DEFAULT_STUDENT_LOGIN_ID;
const DEFAULT_PASSWORD = DEFAULT_STUDENT_PASSWORD;
const MEMORY_TTL_MS = 30 * 1000;

let memoryRegistry: StudentsRegistry | null = null;
let memoryRegistryAt = 0;

export function clearStudentsRegistryCache(): void {
  memoryRegistry = null;
  memoryRegistryAt = 0;
}

async function buildDefaultRegistry(): Promise<StudentsRegistry> {
  const now = new Date().toISOString();
  const year = academicYear();
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

async function loadLegacyRegistry(): Promise<StudentsRegistry | null> {
  const text = await readBlobJsonText(LEGACY_STUDENTS_BLOB_PATH);
  if (!text?.trim()) return null;
  try {
    const data = JSON.parse(text) as StudentsRegistry;
    if (!Array.isArray(data.students)) return null;
    return data;
  } catch {
    return null;
  }
}

async function loadStudentsFromClassFolders(): Promise<StudentRecord[]> {
  const pathnames = await listBlobPathnames(`${PORTAL_ROOT}/`);
  const studentPaths = pathnames.filter((p) => /\/classes\/[^/]+\/students\.json$/.test(p));
  const students: StudentRecord[] = [];

  for (const path of studentPaths) {
    const file = await readBlobJson<{ students?: StudentRecord[] }>(path);
    if (file?.students?.length) {
      students.push(...file.students);
    }
  }

  return students;
}

export async function getStudentsRegistry(options?: { fresh?: boolean }): Promise<StudentsRegistry> {
  noStore();

  if (!options?.fresh && memoryRegistry && Date.now() - memoryRegistryAt < MEMORY_TTL_MS) {
    return memoryRegistry;
  }

  if (!isBlobStorageConfigured()) {
    return buildDefaultRegistry();
  }

  try {
    let students = await loadStudentsFromClassFolders();
    if (students.length === 0) {
      const legacy = await loadLegacyRegistry();
      students = legacy?.students ?? [];
    }

    const registry = { students };
    memoryRegistry = registry;
    memoryRegistryAt = Date.now();
    return registry;
  } catch (error) {
    console.error("Failed to load students registry:", error);
    return { students: [] };
  }
}

export async function saveStudentsRegistry(registry: StudentsRegistry): Promise<void> {
  if (!isBlobStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  const year = academicYear();
  const byClass = new Map<string, StudentRecord[]>();

  for (const student of registry.students) {
    const slug = classSlug(student.standard);
    const list = byClass.get(slug) ?? [];
    list.push(student);
    byClass.set(slug, list);
  }

  const existingPaths = (await listBlobPathnames(`${PORTAL_ROOT}/${year}/classes/`)).filter((p) =>
    p.endsWith("/students.json")
  );
  const written = new Set<string>();

  for (const [slug, students] of byClass) {
    const path = classStudentsBlobPath(year, slug);
    await writeBlobJson(path, { students });
    written.add(path);
  }

  for (const path of existingPaths) {
    if (written.has(path)) continue;
    const parsed = parseClassSlugFromStudentsPath(path);
    if (parsed?.year === year) {
      await writeBlobJson(path, { students: [] });
    }
  }

  memoryRegistry = registry;
  memoryRegistryAt = Date.now();
}

export async function findStudentByLoginId(loginId: string): Promise<StudentRecord | null> {
  const normalized = loginId.trim().toLowerCase();
  const { students } = await getStudentsRegistry({ fresh: true });
  return students.find((s) => s.loginId.trim().toLowerCase() === normalized) ?? null;
}

export async function findStudentById(id: string): Promise<StudentRecord | null> {
  const { students } = await getStudentsRegistry({ fresh: true });
  return students.find((s) => s.id === id) ?? null;
}

function uid() {
  return `stu_${Math.random().toString(36).slice(2, 11)}`;
}

function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(hash);
}

export async function mergeStudentInputs(
  existing: StudentRecord[],
  inputs: StudentAdminInput[]
): Promise<StudentRecord[]> {
  const byId = new Map(existing.map((s) => [s.id, s]));
  const byLoginId = new Map(existing.map((s) => [s.loginId.trim().toLowerCase(), s]));
  const now = new Date().toISOString();
  const next: StudentRecord[] = [];

  for (const input of inputs) {
    const id = input.id || uid();
    const prev = (input.id ? byId.get(input.id) : undefined) ?? byLoginId.get(input.loginId.trim().toLowerCase());
    const loginId = input.loginId.trim();

    if (!loginId || !input.name.trim()) continue;

    let passwordHash = prev?.passwordHash ?? "";
    if (input.password?.trim()) {
      passwordHash = await hashPassword(input.password.trim());
    } else if (!passwordHash || !isBcryptHash(passwordHash)) {
      passwordHash = await hashPassword(DEFAULT_PASSWORD);
    }

    next.push({
      id: prev?.id ?? id,
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
