import { listStoragePathnames, readStorageJson, writeStorageJson } from "@/lib/storage/index";
import { isStorageConfigured } from "@/lib/storage/config";
import {
  classHomeworkPath,
  classStudentsPath,
  messagesPath,
  PORTAL_ROOT,
  studentFeesPath,
} from "@/lib/portal-storage-paths";

export const PORTAL_MANIFEST_PATH = `${PORTAL_ROOT}/manifest.json`;

/** In-process cache TTL — reduces repeat reads on warm serverless instances. */
export const STORAGE_CACHE_TTL_MS = 120_000;

export interface PortalYearIndex {
  studentClassSlugs: string[];
  homeworkClassSlugs: string[];
  messageMonths: string[];
  feeStudentIds: string[];
}

export interface PortalManifest {
  version: 1;
  years: Record<string, PortalYearIndex>;
  updatedAt: string;
}

let memoryManifest: PortalManifest | null = null;
let memoryManifestAt = 0;

export function clearPortalManifestCache(): void {
  memoryManifest = null;
  memoryManifestAt = 0;
}

function emptyYearIndex(): PortalYearIndex {
  return {
    studentClassSlugs: [],
    homeworkClassSlugs: [],
    messageMonths: [],
    feeStudentIds: [],
  };
}

export function emptyPortalManifest(): PortalManifest {
  return {
    version: 1,
    years: {},
    updatedAt: new Date().toISOString(),
  };
}

export function uniqSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function normalizeYearIndex(raw: unknown): PortalYearIndex {
  const data = raw && typeof raw === "object" ? (raw as Partial<PortalYearIndex>) : {};
  return {
    studentClassSlugs: uniqSorted(Array.isArray(data.studentClassSlugs) ? data.studentClassSlugs : []),
    homeworkClassSlugs: uniqSorted(Array.isArray(data.homeworkClassSlugs) ? data.homeworkClassSlugs : []),
    messageMonths: uniqSorted(Array.isArray(data.messageMonths) ? data.messageMonths : []),
    feeStudentIds: uniqSorted(Array.isArray(data.feeStudentIds) ? data.feeStudentIds : []),
  };
}

function normalizeManifest(raw: unknown): PortalManifest {
  if (!raw || typeof raw !== "object") return emptyPortalManifest();
  const data = raw as Partial<PortalManifest>;
  const years: Record<string, PortalYearIndex> = {};
  if (data.years && typeof data.years === "object") {
    for (const [year, index] of Object.entries(data.years)) {
      years[year] = normalizeYearIndex(index);
    }
  }
  return {
    version: 1,
    years,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
  };
}

export function getYearIndex(manifest: PortalManifest, year: string): PortalYearIndex {
  return manifest.years[year] ?? emptyYearIndex();
}

export function studentJsonPaths(manifest: PortalManifest): string[] {
  const paths: string[] = [];
  for (const [year, index] of Object.entries(manifest.years)) {
    for (const slug of index.studentClassSlugs) {
      paths.push(classStudentsPath(year, slug));
    }
  }
  return paths;
}

export function homeworkJsonPaths(manifest: PortalManifest, year?: string): string[] {
  const paths: string[] = [];
  for (const [y, index] of Object.entries(manifest.years)) {
    if (year && y !== year) continue;
    for (const slug of index.homeworkClassSlugs) {
      paths.push(classHomeworkPath(y, slug));
    }
  }
  return paths;
}

export function homeworkJsonPathsForStudent(
  manifest: PortalManifest,
  year: string,
  studentClassSlug: string
): string[] {
  const slugs = uniqSorted([studentClassSlug, "all-classes", "individual"]);
  return slugs.map((slug) => classHomeworkPath(year, slug));
}

export function messageJsonPaths(manifest: PortalManifest): string[] {
  const months = uniqSorted(Object.values(manifest.years).flatMap((index) => index.messageMonths));
  return months.map((yearMonth) => messagesPath(yearMonth));
}

export function feeJsonPaths(manifest: PortalManifest, year: string, extraStudentIds: string[] = []): string[] {
  const index = getYearIndex(manifest, year);
  const ids = uniqSorted([...index.feeStudentIds, ...extraStudentIds]);
  return ids.map((id) => studentFeesPath(year, id));
}

export async function bootstrapPortalManifestFromStorage(): Promise<PortalManifest> {
  const manifest = emptyPortalManifest();
  const pathnames = await listStoragePathnames(`${PORTAL_ROOT}/`);

  for (const path of pathnames) {
    const studentsMatch = path.match(/^portal\/(\d{4})\/classes\/([^/]+)\/students\.json$/);
    if (studentsMatch) {
      const [, year, slug] = studentsMatch;
      const index = manifest.years[year] ?? emptyYearIndex();
      index.studentClassSlugs = uniqSorted([...index.studentClassSlugs, slug]);
      manifest.years[year] = index;
      continue;
    }

    const homeworkMatch = path.match(/^portal\/(\d{4})\/classes\/([^/]+)\/homework\.json$/);
    if (homeworkMatch) {
      const [, year, slug] = homeworkMatch;
      const index = manifest.years[year] ?? emptyYearIndex();
      index.homeworkClassSlugs = uniqSorted([...index.homeworkClassSlugs, slug]);
      manifest.years[year] = index;
      continue;
    }

    const messagesMatch = path.match(/^portal\/(\d{4})\/(\d{2})\/messages\.json$/);
    if (messagesMatch) {
      const [, year, month] = messagesMatch;
      const yearMonth = `${year}/${month}`;
      const index = manifest.years[year] ?? emptyYearIndex();
      index.messageMonths = uniqSorted([...index.messageMonths, yearMonth]);
      manifest.years[year] = index;
      continue;
    }

    const feesMatch = path.match(/^portal\/(\d{4})\/accounts\/([^/]+)\.json$/);
    if (feesMatch) {
      const [, year, studentId] = feesMatch;
      const index = manifest.years[year] ?? emptyYearIndex();
      index.feeStudentIds = uniqSorted([...index.feeStudentIds, studentId]);
      manifest.years[year] = index;
    }
  }

  manifest.updatedAt = new Date().toISOString();
  return manifest;
}

export async function readPortalManifest(options?: { fresh?: boolean }): Promise<PortalManifest | null> {
  if (!isStorageConfigured()) return null;

  if (!options?.fresh && memoryManifest && Date.now() - memoryManifestAt < STORAGE_CACHE_TTL_MS) {
    return memoryManifest;
  }

  const raw = await readStorageJson<PortalManifest>(PORTAL_MANIFEST_PATH);
  if (!raw) return null;

  const manifest = normalizeManifest(raw);
  memoryManifest = manifest;
  memoryManifestAt = Date.now();
  return manifest;
}

export async function savePortalManifest(manifest: PortalManifest): Promise<void> {
  const next: PortalManifest = {
    ...manifest,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  await writeStorageJson(PORTAL_MANIFEST_PATH, next);
  memoryManifest = next;
  memoryManifestAt = Date.now();
}

export async function ensurePortalManifest(options?: { fresh?: boolean }): Promise<PortalManifest> {
  if (!isStorageConfigured()) return emptyPortalManifest();

  const existing = await readPortalManifest(options);
  if (existing && Object.keys(existing.years).length > 0) return existing;

  const bootstrapped = await bootstrapPortalManifestFromStorage();
  if (Object.keys(bootstrapped.years).length === 0) {
    return existing ?? bootstrapped;
  }

  if (!existing || Object.keys(existing.years).length === 0) {
    await savePortalManifest(bootstrapped);
  }
  return bootstrapped;
}

export async function updatePortalYearIndex(
  year: string,
  updater: (current: PortalYearIndex) => PortalYearIndex
): Promise<PortalManifest> {
  const manifest = await ensurePortalManifest();
  const current = getYearIndex(manifest, year);
  const nextIndex = updater(current);
  const next: PortalManifest = {
    ...manifest,
    years: {
      ...manifest.years,
      [year]: {
        studentClassSlugs: uniqSorted(nextIndex.studentClassSlugs),
        homeworkClassSlugs: uniqSorted(nextIndex.homeworkClassSlugs),
        messageMonths: uniqSorted(nextIndex.messageMonths),
        feeStudentIds: uniqSorted(nextIndex.feeStudentIds),
      },
    },
    updatedAt: new Date().toISOString(),
  };
  await savePortalManifest(next);
  return next;
}

export function syncHomeworkSlugsAfterSave(index: PortalYearIndex, touchedSlugs: string[]): PortalYearIndex {
  return { ...index, homeworkClassSlugs: uniqSorted([...index.homeworkClassSlugs, ...touchedSlugs]) };
}

export function syncMessageMonthsAfterSave(index: PortalYearIndex, touchedMonths: string[]): PortalYearIndex {
  return { ...index, messageMonths: uniqSorted([...index.messageMonths, ...touchedMonths]) };
}

export function syncStudentClassSlugsAfterSave(index: PortalYearIndex, activeSlugs: string[]): PortalYearIndex {
  return { ...index, studentClassSlugs: uniqSorted(activeSlugs) };
}
