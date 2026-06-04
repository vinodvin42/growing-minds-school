import { unstable_noStore as noStore } from "next/cache";
import { listBlobPathnames, readBlobJson, writeBlobJson } from "@/lib/blob-json";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";
import {
  academicYear,
  classHomeworkBlobPath,
  classSlug,
  LEGACY_PORTAL_BLOB_PATH,
  messagesBlobPath,
  PORTAL_ROOT,
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
const MEMORY_TTL_MS = 30 * 1000;

/** Which class folder a homework item belongs in when saved. */
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

async function loadItemsFromPaths<T>(suffix: string): Promise<T[]> {
  const pathnames = await listBlobPathnames(`${PORTAL_ROOT}/`);
  const targetPaths = pathnames.filter((p) => p.endsWith(`/${suffix}`));
  const items: T[] = [];

  for (const path of targetPaths) {
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
  const fromFolders = dedupeById(await loadItemsFromPaths<HomeworkItem>("homework.json"));
  if (fromFolders.length > 0) return fromFolders;
  const legacy = await loadLegacyPortal();
  return legacy?.homework ?? [];
}

/** Load homework files for one student (class + school-wide + individual). */
async function loadHomeworkForStudent(student: StudentProfile): Promise<HomeworkItem[]> {
  if (!isBlobStorageConfigured()) return [];

  const studentSlug = classSlug(student.standard);
  const pathnames = await listBlobPathnames(`${PORTAL_ROOT}/`);
  const relevantPaths = pathnames.filter((p) => {
    if (!p.endsWith("/homework.json")) return false;
    if (p.endsWith(`/classes/${studentSlug}/homework.json`)) return true;
    if (p.endsWith(`/classes/${ALL_CLASSES_SLUG}/homework.json`)) return true;
    if (p.endsWith(`/classes/${INDIVIDUAL_SLUG}/homework.json`)) return true;
    return false;
  });

  const items: HomeworkItem[] = [];
  for (const path of relevantPaths) {
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
  const fromFolders = await loadItemsFromPaths<TeacherMessage>("messages.json");
  if (fromFolders.length > 0) return fromFolders;
  const legacy = await loadLegacyPortal();
  return legacy?.messages ?? [];
}

export async function getStudentPortalData(options?: { fresh?: boolean }): Promise<StudentPortalData> {
  noStore();

  if (!options?.fresh && memoryPortal && Date.now() - memoryPortalAt < MEMORY_TTL_MS) {
    return memoryPortal;
  }

  if (!isBlobStorageConfigured()) {
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
  if (!isBlobStorageConfigured()) return emptyPortal();

  const [homework, messages] = await Promise.all([
    loadHomeworkForStudent(student),
    loadMessageItems().then((all) => all.filter((m) => matchesStudentAudience(m, student))),
  ]);

  return { homework, messages };
}

async function saveHomeworkByClass(items: HomeworkItem[]): Promise<void> {
  const partitions = partitionHomeworkByClass(items);
  const existingPaths = (await listBlobPathnames(`${PORTAL_ROOT}/`)).filter((p) => p.endsWith("/homework.json"));
  const touched = new Set<string>();

  for (const [key, bucket] of partitions) {
    const [year, slug] = key.split("/");
    const path = classHomeworkBlobPath(year, slug);
    await writeBlobJson(path, { items: bucket });
    touched.add(path);
  }

  for (const path of existingPaths) {
    if (!touched.has(path)) {
      await writeBlobJson(path, { items: [] });
    }
  }
}

async function writeMessagesByMonth(items: TeacherMessage[]): Promise<void> {
  const partitions = partitionByYearMonth(items);
  const existingPaths = (await listBlobPathnames(`${PORTAL_ROOT}/`)).filter((p) => p.endsWith("/messages.json"));
  const touched = new Set<string>();

  for (const [yearMonth, bucket] of partitions) {
    const path = messagesBlobPath(yearMonth);
    await writeBlobJson(path, { items: bucket });
    touched.add(path);
  }

  for (const path of existingPaths) {
    if (!touched.has(path)) {
      await writeBlobJson(path, { items: [] });
    }
  }
}

export async function saveStudentPortalData(data: StudentPortalData): Promise<StudentPortalData> {
  if (!isBlobStorageConfigured()) {
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
