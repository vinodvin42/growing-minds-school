import { CONTENT_BLOB_PATH } from "@/data/default-content";
import { readBlobJsonText } from "@/lib/blob-read";
import { readBlobJson } from "@/lib/blob-json";
import { isStorageConfigured, storageBackend } from "@/lib/blob-storage";
import {
  bootstrapPortalManifestFromBlob,
  clearPortalManifestCache,
  readPortalManifest,
  savePortalManifest,
} from "@/lib/portal-manifest";
import {
  LEGACY_PORTAL_BLOB_PATH,
  LEGACY_STUDENTS_BLOB_PATH,
} from "@/lib/portal-storage-paths";
import { writeStorageBinary, writeStorageText } from "@/lib/storage/index";
import { saveStudentPortalData } from "@/lib/student-portal-store";
import { getStudentsRegistry, saveStudentsRegistry } from "@/lib/student-store";
import type { StudentPortalData } from "@/types/student-portal";
import type { StudentsRegistry } from "@/types/student";

export type StorageMigrationReport = {
  success: boolean;
  backend: string;
  legacyStudentsMigrated: number;
  legacyPortalHomework: number;
  legacyPortalMessages: number;
  manifestYears: string[];
  manifestIndexed: {
    studentClassSlugs: number;
    homeworkClassSlugs: number;
    messageMonths: number;
    feeStudentIds: number;
  };
  blobFilesCopied?: number;
  errors: string[];
};

async function loadLegacyStudentsRegistry(): Promise<StudentsRegistry | null> {
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

async function loadLegacyPortalData(): Promise<StudentPortalData | null> {
  const legacy = await readBlobJson<StudentPortalData>(LEGACY_PORTAL_BLOB_PATH);
  if (!legacy) return null;
  return {
    homework: Array.isArray(legacy.homework) ? legacy.homework : [],
    messages: Array.isArray(legacy.messages) ? legacy.messages : [],
  };
}

/** Move legacy single-file Blob data into portal/{year}/… layout + rebuild manifest. Safe on Vercel (still uses Blob). */
export async function migrateStorageLayout(): Promise<StorageMigrationReport> {
  const errors: string[] = [];
  const report: StorageMigrationReport = {
    success: false,
    backend: storageBackend(),
    legacyStudentsMigrated: 0,
    legacyPortalHomework: 0,
    legacyPortalMessages: 0,
    manifestYears: [],
    manifestIndexed: {
      studentClassSlugs: 0,
      homeworkClassSlugs: 0,
      messageMonths: 0,
      feeStudentIds: 0,
    },
    errors,
  };

  if (!isStorageConfigured()) {
    errors.push("Storage is not configured.");
    return report;
  }

  try {
    const current = await getStudentsRegistry({ fresh: true });
    const legacyStudents = await loadLegacyStudentsRegistry();

    if (legacyStudents?.students.length && current.students.length === 0) {
      await saveStudentsRegistry(legacyStudents);
      report.legacyStudentsMigrated = legacyStudents.students.length;
    }

    const legacyPortal = await loadLegacyPortalData();

    if (legacyPortal && (legacyPortal.homework.length > 0 || legacyPortal.messages.length > 0)) {
      const manifest = await readPortalManifest();
      const alreadyMigrated =
        manifest &&
        Object.values(manifest.years).some(
          (y) => y.homeworkClassSlugs.length > 0 || y.messageMonths.length > 0
        );

      if (!alreadyMigrated) {
        await saveStudentPortalData(legacyPortal);
        report.legacyPortalHomework = legacyPortal.homework.length;
        report.legacyPortalMessages = legacyPortal.messages.length;
      }
    }

    clearPortalManifestCache();
    const manifest = await bootstrapPortalManifestFromBlob();
    await savePortalManifest(manifest);

    report.manifestYears = Object.keys(manifest.years).sort();
    for (const year of report.manifestYears) {
      const index = manifest.years[year];
      report.manifestIndexed.studentClassSlugs += index.studentClassSlugs.length;
      report.manifestIndexed.homeworkClassSlugs += index.homeworkClassSlugs.length;
      report.manifestIndexed.messageMonths += index.messageMonths.length;
      report.manifestIndexed.feeStudentIds += index.feeStudentIds.length;
    }

    report.success = errors.length === 0;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Migration failed");
  }

  return report;
}

async function listAllBlobPathnames(): Promise<string[]> {
  const { listBlobPathnames } = await import("@/lib/storage/blob");
  return listBlobPathnames("");
}

async function readBlobFileBytes(pathname: string): Promise<{ data: Buffer; contentType: string } | null> {
  const { readBlobFileBytes: readBytes } = await import("@/lib/storage/blob");
  return readBytes(pathname);
}

/**
 * Copy every file from Vercel Blob into the current storage backend (usually ./data).
 * Run locally with BLOB_READ_WRITE_TOKEN + STORAGE_BACKEND=filesystem — not on Vercel serverless.
 */
export async function copyAllBlobFilesToStorage(): Promise<StorageMigrationReport> {
  const layoutReport = await migrateStorageLayout();
  const errors = [...layoutReport.errors];

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    errors.push("BLOB_READ_WRITE_TOKEN is required to read from Vercel Blob.");
    return { ...layoutReport, success: false, errors };
  }

  if (storageBackend() === "blob") {
    layoutReport.blobFilesCopied = 0;
    layoutReport.success = errors.length === 0;
    return layoutReport;
  }

  let copied = 0;

  try {
    const pathnames = await listAllBlobPathnames();
    for (const pathname of pathnames) {
      const file = await readBlobFileBytes(pathname);
      if (!file) {
        errors.push(`Could not read: ${pathname}`);
        continue;
      }

      if (file.contentType.includes("json") || pathname.endsWith(".json")) {
        await writeStorageText(pathname, file.data.toString("utf8"), file.contentType);
      } else {
        await writeStorageBinary(pathname, file.data, file.contentType);
      }
      copied++;
    }

    const siteContent = await readBlobFileBytes(CONTENT_BLOB_PATH);
    if (siteContent) {
      await writeStorageText(CONTENT_BLOB_PATH, siteContent.data.toString("utf8"), "application/json");
      copied++;
    }

    clearPortalManifestCache();
    const manifest = await bootstrapPortalManifestFromBlob();
    await savePortalManifest(manifest);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Blob copy failed");
  }

  return {
    ...layoutReport,
    blobFilesCopied: copied,
    success: errors.length === 0,
    errors,
  };
}
