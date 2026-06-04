import { get, put } from "@vercel/blob";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";
import type { HomeworkItem, StudentPortalData, TeacherMessage } from "@/types/student-portal";

export const STUDENT_PORTAL_BLOB_PATH = "student-portal-data.json";

const emptyPortal = (): StudentPortalData => ({ homework: [], messages: [] });

export async function getStudentPortalData(): Promise<StudentPortalData> {
  if (!isBlobStorageConfigured()) {
    return emptyPortal();
  }

  try {
    const result = await get(STUDENT_PORTAL_BLOB_PATH, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return emptyPortal();
    }
    const text = await new Response(result.stream).text();
    if (!text.trim()) return emptyPortal();
    const data = JSON.parse(text) as StudentPortalData;
    return {
      homework: Array.isArray(data.homework) ? data.homework : [],
      messages: Array.isArray(data.messages) ? data.messages : [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("not found")) return emptyPortal();
    console.error("Failed to load student portal data:", error);
    return emptyPortal();
  }
}

export async function saveStudentPortalData(data: StudentPortalData): Promise<void> {
  if (!isBlobStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  await put(STUDENT_PORTAL_BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export type { HomeworkItem, TeacherMessage, StudentPortalData };
