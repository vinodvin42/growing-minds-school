import { unstable_noStore as noStore } from "next/cache";
import { hashPassword } from "@/lib/password";
import {
  STORAGE_CACHE_TTL_MS,
  ensurePortalManifest,
  getYearIndex,
  clearPortalManifestCache,
  PORTAL_MANIFEST_PATH,
  studentJsonPaths,
  syncStudentClassSlugsAfterSave,
} from "@/lib/portal-manifest";
import {
  academicYear,
  classSlug,
  classStudentsPath,
  LEGACY_STUDENTS_PATH,
} from "@/lib/portal-storage-paths";
import { isStorageConfigured, storageErrorMessage } from "@/lib/storage/config";
import { readStorageJson, readStorageText, writeStorageJson, writeStorageJsonBatch } from "@/lib/storage/index";
import type { StudentAdminInput, StudentRecord, StudentsRegistry } from "@/types/student";
import { DEFAULT_STUDENT_LOGIN_ID, DEFAULT_STUDENT_PASSWORD } from "@/types/student";

const DEFAULT_LOGIN_ID = DEFAULT_STUDENT_LOGIN_ID;
const DEFAULT_PASSWORD = DEFAULT_STUDENT_PASSWORD;

let memoryRegistry: StudentsRegistry | null = null;
let memoryRegistryAt = 0;

export function clearStudentsRegistryCache(): void {
  memoryRegistry = null;
  memoryRegistryAt = 0;
}

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

async function loadLegacyRegistry(): Promise<StudentsRegistry | null> {
  const text = await readStorageText(LEGACY_STUDENTS_PATH);
  if (!text?.trim()) return null;
  try {
    const data = JSON.parse(text) as StudentsRegistry;
    if (!Array.isArray(data.students)) return null;
    return data;
  } catch {
    return null;
  }
}

async function loadStudentsFromManifest(): Promise<StudentRecord[]> {
  const manifest = await ensurePortalManifest();
  const paths = studentJsonPaths(manifest);
  const students: StudentRecord[] = [];

  for (const path of paths) {
    const file = await readStorageJson<{ students?: StudentRecord[] }>(path);
    if (file?.students?.length) {
      students.push(...file.students);
    }
  }

  return students;
}

export async function getStudentsRegistry(options?: { fresh?: boolean }): Promise<StudentsRegistry> {
  noStore();

  if (!options?.fresh && memoryRegistry && Date.now() - memoryRegistryAt < STORAGE_CACHE_TTL_MS) {
    return memoryRegistry;
  }

  if (!isStorageConfigured()) {
    return buildDefaultRegistry();
  }

  try {
    let students = await loadStudentsFromManifest();
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
  if (!isStorageConfigured()) {
    throw new Error(storageErrorMessage());
  }

  const year = academicYear();
  const byClass = new Map<string, StudentRecord[]>();

  for (const student of registry.students) {
    const slug = classSlug(student.standard);
    const list = byClass.get(slug) ?? [];
    list.push(student);
    byClass.set(slug, list);
  }

  const activeSlugs = [...byClass.keys()];
  const manifest = await ensurePortalManifest();
  const knownSlugs = manifest.years[year]?.studentClassSlugs ?? [];

  const files = [...new Set([...activeSlugs, ...knownSlugs])].map((slug) => ({
    relativePath: classStudentsPath(year, slug),
    data: { students: byClass.get(slug) ?? [] },
  }));

  const updatedManifest = {
    ...manifest,
    years: {
      ...manifest.years,
      [year]: syncStudentClassSlugsAfterSave(getYearIndex(manifest, year), activeSlugs),
    },
    updatedAt: new Date().toISOString(),
  };

  await writeStorageJsonBatch(
    [...files, { relativePath: PORTAL_MANIFEST_PATH, data: updatedManifest }],
    `Update student roster (${registry.students.length} students)`
  );

  clearPortalManifestCache();
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
