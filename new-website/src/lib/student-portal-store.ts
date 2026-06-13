import { unstable_noStore as noStore } from "next/cache";
import { readBlobJson, writeBlobJson } from "@/lib/blob-json";
import { blobStorageErrorMessage, isStorageConfigured } from "@/lib/blob-storage";
import {
  BLOB_MEMORY_TTL_MS,
  ensurePortalManifest,
  getYearIndex,
  homeworkJsonPaths,
  homeworkJsonPathsForStudent,
  messageJsonPaths,
  syncHomeworkSlugsAfterSave,
  syncMessageMonthsAfterSave,
  updatePortalYearIndex,
} from "@/lib/portal-manifest";
import {
  academicYear,
  classHomeworkBlobPath,
  classSlug,
  LEGACY_PORTAL_BLOB_PATH,
  messagesBlobPath,
  yearMonthFromDate,
} from "@/lib/portal-storage-paths";
import type { HomeworkItem, StudentPortalData, TeacherMessage } from "@/types/student-portal";
import type { StudentProfile } from "@/types/student";
import { matchesStudentAudience } from "@/types/student-portal";

type ItemsFile<T> = { items: T[] };

const ALL_CLASSES_SLUG = "all-classes";
const INDIVIDUAL_SLUG = "individual";

const emptyPortal = (): StudentPortalData => ({ homework: [], messages: [] });

let memoryPortal: StudentPortalData | null = null;
let memoryPortalAt = 0;

export function homeworkClassSlug(item: HomeworkItem): string {
  if (item.audience === "individual") return INDIVIDUAL_SLUG;
  if (item.audience === "all") return ALL_CLASSES_SLUG;
  const std = item.standard?.trim();
  if (!std || std === "All") return ALL_CLASSES_SLUG;
  return classSlug(std);
}

function partitionHomeworkByClass(items: HomeworkItem[]): Map<string, HomeworkItem[]> {
  const map = new Map<string, HomeworkItem[]>();
  for (const item of items) {
    const year = academicYear(item.createdAt);
    const slug = homeworkClassSlug(item);
    const key = `${year}/${slug}`;
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

function partitionByYearMonth<T extends { createdAt: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = yearMonthFromDate(item.createdAt);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

async function loadLegacyPortal(): Promise<StudentPortalData | null> {
  const legacy = await readBlobJson<StudentPortalData>(LEGACY_PORTAL_BLOB_PATH);
  if (!legacy) return null;
  return {
    homework: Array.isArray(legacy.homework) ? legacy.homework : [],
    messages: Array.isArray(legacy.messages) ? legacy.messages : [],
  };
}

async function readItemsFromPaths<T>(
  paths: string[],
  suffix: string
): Promise<T[]> {
  const items: T[] = [];

  for (const path of paths) {
    const file = await readBlobJson<ItemsFile<T> | { homework?: T[]; messages?: T[] }>(path);
    if (!file) continue;
    if (Array.isArray((file as ItemsFile<T>).items)) {
      items.push(...(file as ItemsFile<T>).items);
    } else if (suffix === "homework.json" && Array.isArray((file as { homework?: T[] }).homework)) {
      items.push(...(file as { homework: T[] }).homework);
    } else if (suffix === "messages.json" && Array.isArray((file as { messages?: T[] }).messages)) {
      items.push(...(file as { messages: T[] }).messages);
    }
  }

  return items;
}

async function loadHomeworkItems(): Promise<HomeworkItem[]> {
  const manifest = await ensurePortalManifest();
  const paths = homeworkJsonPaths(manifest);
  const fromFolders = dedupeById(await readItemsFromPaths<HomeworkItem>(paths, "homework.json"));
  if (fromFolders.length > 0) return fromFolders;
  const legacy = await loadLegacyPortal();
  return legacy?.homework ?? [];
}

async function loadHomeworkForStudent(student: StudentProfile): Promise<HomeworkItem[]> {
  if (!isStorageConfigured()) return [];

  const year = academicYear();
  const manifest = await ensurePortalManifest();
  const studentSlug = classSlug(student.standard);
  const paths = homeworkJsonPathsForStudent(manifest, year, studentSlug);

  const items: HomeworkItem[] = [];
  for (const path of paths) {
    const file = await readBlobJson<ItemsFile<HomeworkItem>>(path);
    if (file?.items?.length) items.push(...file.items);
  }

  if (items.length > 0) {
    return dedupeById(items).filter((h) => matchesStudentAudience(h, student));
  }

  const all = await loadHomeworkItems();
  return all.filter((h) => matchesStudentAudience(h, student));
}

async function loadMessageItems(): Promise<TeacherMessage[]> {
  const manifest = await ensurePortalManifest();
  const paths = messageJsonPaths(manifest);
  const fromFolders = await readItemsFromPaths<TeacherMessage>(paths, "messages.json");
  if (fromFolders.length > 0) return fromFolders;
  const legacy = await loadLegacyPortal();
  return legacy?.messages ?? [];
}

export async function getStudentPortalData(options?: { fresh?: boolean }): Promise<StudentPortalData> {
  noStore();

  if (!options?.fresh && memoryPortal && Date.now() - memoryPortalAt < BLOB_MEMORY_TTL_MS) {
    return memoryPortal;
  }

  if (!isStorageConfigured()) {
    return emptyPortal();
  }

  try {
    const data: StudentPortalData = {
      homework: await loadHomeworkItems(),
      messages: await loadMessageItems(),
    };
    memoryPortal = data;
    memoryPortalAt = Date.now();
    return data;
  } catch (error) {
    console.error("Failed to load student portal data:", error);
    return emptyPortal();
  }
}

export async function getStudentPortalDataForStudent(student: StudentProfile): Promise<StudentPortalData> {
  noStore();
  if (!isStorageConfigured()) return emptyPortal();

  const [homework, messages] = await Promise.all([
    loadHomeworkForStudent(student),
    loadMessageItems().then((all) => all.filter((m) => matchesStudentAudience(m, student))),
  ]);

  return { homework, messages };
}

async function saveHomeworkByClass(items: HomeworkItem[]): Promise<void> {
  const partitions = partitionHomeworkByClass(items);
  const manifest = await ensurePortalManifest();
  const affectedYears = new Set<string>(Object.keys(manifest.years));
  for (const key of partitions.keys()) {
    affectedYears.add(key.split("/")[0]);
  }
  if (affectedYears.size === 0) {
    affectedYears.add(academicYear());
  }

  for (const year of affectedYears) {
    const known = getYearIndex(manifest, year).homeworkClassSlugs;
    const touched = new Set<string>();

    for (const [key, bucket] of partitions) {
      const [y, slug] = key.split("/");
      if (y !== year) continue;
      await writeBlobJson(classHomeworkBlobPath(y, slug), { items: bucket });
      touched.add(slug);
    }

    for (const slug of known) {
      if (!touched.has(slug)) {
        await writeBlobJson(classHomeworkBlobPath(year, slug), { items: [] });
      }
    }

    await updatePortalYearIndex(year, (index) =>
      touched.size > 0
        ? syncHomeworkSlugsAfterSave(index, [...touched])
        : { ...index, homeworkClassSlugs: [] }
    );
  }
}

async function writeMessagesByMonth(items: TeacherMessage[]): Promise<void> {
  const partitions = partitionByYearMonth(items);
  const manifest = await ensurePortalManifest();
  const affectedYears = new Set<string>(Object.keys(manifest.years));
  for (const yearMonth of partitions.keys()) {
    affectedYears.add(yearMonth.split("/")[0]);
  }
  if (affectedYears.size === 0) {
    affectedYears.add(academicYear());
  }

  for (const year of affectedYears) {
    const known = getYearIndex(manifest, year).messageMonths;
    const touched = new Set<string>();

    for (const [yearMonth, bucket] of partitions) {
      if (!yearMonth.startsWith(`${year}/`)) continue;
      await writeBlobJson(messagesBlobPath(yearMonth), { items: bucket });
      touched.add(yearMonth);
    }

    for (const month of known) {
      if (!touched.has(month)) {
        await writeBlobJson(messagesBlobPath(month), { items: [] });
      }
    }

    await updatePortalYearIndex(year, (index) =>
      touched.size > 0
        ? syncMessageMonthsAfterSave(index, [...touched])
        : { ...index, messageMonths: [] }
    );
  }
}

export async function saveStudentPortalData(data: StudentPortalData): Promise<StudentPortalData> {
  if (!isStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  const homework = Array.isArray(data.homework) ? data.homework : [];
  const messages = Array.isArray(data.messages) ? data.messages : [];

  await saveHomeworkByClass(homework);
  await writeMessagesByMonth(messages);

  const saved = { homework, messages };
  memoryPortal = saved;
  memoryPortalAt = Date.now();
  return saved;
}

export function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type { HomeworkItem, TeacherMessage, StudentPortalData };
