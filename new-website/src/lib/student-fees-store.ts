import { unstable_noStore as noStore } from "next/cache";
import { isStorageConfigured, storageErrorMessage } from "@/lib/storage/config";
import { readStorageJson, writeStorageJsonBatch } from "@/lib/storage/index";
import {
  STORAGE_CACHE_TTL_MS,
  ensurePortalManifest,
  feeJsonPaths,
  getYearIndex,
  clearPortalManifestCache,
  PORTAL_MANIFEST_PATH,
  uniqSorted,
} from "@/lib/portal-manifest";
import { academicYear, studentFeesPath } from "@/lib/portal-storage-paths";
import {
  emptyFeeAccount,
  toFeeSummary,
  type StudentFeeAccount,
  type StudentFeeSummary,
} from "@/types/student-fees";

let memoryAccounts = new Map<string, StudentFeeAccount>();
let memoryAccountsAt = 0;
let memoryYear = "";

function normalizeAccount(raw: StudentFeeAccount, year: string): StudentFeeAccount {
  return {
    studentId: raw.studentId,
    academicYear: raw.academicYear || year,
    lineItems: Array.isArray(raw.lineItems) ? raw.lineItems : [],
    payments: Array.isArray(raw.payments) ? raw.payments : [],
    notes: raw.notes ?? "",
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

async function loadAccountsFromManifest(year: string, extraStudentIds: string[] = []): Promise<Map<string, StudentFeeAccount>> {
  const manifest = await ensurePortalManifest();
  const paths = feeJsonPaths(manifest, year, extraStudentIds);
  const map = new Map<string, StudentFeeAccount>();

  for (const path of paths) {
    const file = await readStorageJson<StudentFeeAccount>(path);
    if (!file?.studentId) continue;
    map.set(file.studentId, normalizeAccount(file, year));
  }

  return map;
}

async function getAccountMap(year: string, fresh?: boolean, extraStudentIds: string[] = []): Promise<Map<string, StudentFeeAccount>> {
  if (!fresh && memoryYear === year && Date.now() - memoryAccountsAt < STORAGE_CACHE_TTL_MS) {
    return memoryAccounts;
  }

  if (!isStorageConfigured()) {
    memoryAccounts = new Map(memoryAccounts);
    memoryYear = year;
    memoryAccountsAt = Date.now();
    return memoryAccounts;
  }

  memoryAccounts = await loadAccountsFromManifest(year, extraStudentIds);
  memoryYear = year;
  memoryAccountsAt = Date.now();
  return memoryAccounts;
}

export async function getStudentFeeAccount(
  studentId: string,
  year: string = academicYear()
): Promise<StudentFeeAccount> {
  noStore();

  if (!isStorageConfigured()) {
    return emptyFeeAccount(studentId, year);
  }

  const path = studentFeesPath(year, studentId);
  const file = await readStorageJson<StudentFeeAccount>(path);
  if (file?.studentId) {
    return normalizeAccount(file, year);
  }

  return emptyFeeAccount(studentId, year);
}

export async function getStudentFeeSummary(
  studentId: string,
  year: string = academicYear()
): Promise<StudentFeeSummary> {
  const account = await getStudentFeeAccount(studentId, year);
  return toFeeSummary(account);
}

export async function getAllStudentFeeSummaries(
  studentIds: string[],
  year: string = academicYear()
): Promise<StudentFeeSummary[]> {
  noStore();
  const map = await getAccountMap(year, false, studentIds);
  return studentIds.map((id) => toFeeSummary(map.get(id) ?? emptyFeeAccount(id, year)));
}

export async function saveStudentFeeAccount(account: StudentFeeAccount): Promise<StudentFeeAccount> {
  const summaries = await saveStudentFeeAccounts([account]);
  const saved = summaries[0];
  return {
    studentId: saved.studentId,
    academicYear: saved.academicYear,
    lineItems: saved.lineItems,
    payments: saved.payments,
    notes: saved.notes,
    updatedAt: saved.updatedAt,
  };
}

export async function saveStudentFeeAccounts(accounts: StudentFeeAccount[]): Promise<StudentFeeSummary[]> {
  if (!isStorageConfigured()) {
    throw new Error(storageErrorMessage());
  }

  if (accounts.length === 0) return [];

  const year = accounts[0]?.academicYear || academicYear();
  const normalized = accounts.map((account) => ({
    ...normalizeAccount(account, year),
    updatedAt: new Date().toISOString(),
  }));

  const manifest = await ensurePortalManifest();
  const yearIndex = getYearIndex(manifest, year);
  const updatedManifest = {
    ...manifest,
    years: {
      ...manifest.years,
      [year]: {
        ...yearIndex,
        feeStudentIds: uniqSorted([...yearIndex.feeStudentIds, ...normalized.map((a) => a.studentId)]),
      },
    },
    updatedAt: new Date().toISOString(),
  };

  const files = [
    ...normalized.map((account) => ({
      relativePath: studentFeesPath(year, account.studentId),
      data: account,
    })),
    { relativePath: PORTAL_MANIFEST_PATH, data: updatedManifest },
  ];

  await writeStorageJsonBatch(files, `Update student fee accounts (${normalized.length} students)`);

  clearPortalManifestCache();

  const map = await getAccountMap(year, true);
  for (const account of normalized) {
    map.set(account.studentId, account);
  }
  memoryAccounts = map;
  memoryAccountsAt = Date.now();
  memoryYear = year;

  return normalized.map(toFeeSummary);
}
