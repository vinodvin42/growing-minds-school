import { unstable_noStore as noStore } from "next/cache";
import { listBlobPathnames, readBlobJson, writeBlobJson } from "@/lib/blob-json";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";
import { academicYear, PORTAL_ROOT, studentFeesBlobPath } from "@/lib/portal-storage-paths";
import {
  emptyFeeAccount,
  toFeeSummary,
  type StudentFeeAccount,
  type StudentFeeSummary,
} from "@/types/student-fees";

const MEMORY_TTL_MS = 30 * 1000;
let memoryAccounts = new Map<string, StudentFeeAccount>();
let memoryAccountsAt = 0;
let memoryYear = "";

function accountKey(studentId: string, year: string): string {
  return `${year}:${studentId}`;
}

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

async function loadAccountsFromBlob(year: string): Promise<Map<string, StudentFeeAccount>> {
  const prefix = `${PORTAL_ROOT}/${year}/accounts/`;
  const pathnames = await listBlobPathnames(prefix);
  const map = new Map<string, StudentFeeAccount>();

  for (const path of pathnames) {
    if (!path.endsWith(".json")) continue;
    const file = await readBlobJson<StudentFeeAccount>(path);
    if (!file?.studentId) continue;
    map.set(file.studentId, normalizeAccount(file, year));
  }

  return map;
}

async function getAccountMap(year: string, fresh?: boolean): Promise<Map<string, StudentFeeAccount>> {
  if (!fresh && memoryYear === year && Date.now() - memoryAccountsAt < MEMORY_TTL_MS) {
    return memoryAccounts;
  }

  if (!isBlobStorageConfigured()) {
    memoryAccounts = new Map(memoryAccounts);
    memoryYear = year;
    memoryAccountsAt = Date.now();
    return memoryAccounts;
  }

  memoryAccounts = await loadAccountsFromBlob(year);
  memoryYear = year;
  memoryAccountsAt = Date.now();
  return memoryAccounts;
}

export async function getStudentFeeAccount(
  studentId: string,
  year: string = academicYear()
): Promise<StudentFeeAccount> {
  noStore();
  const map = await getAccountMap(year);
  return map.get(studentId) ?? emptyFeeAccount(studentId, year);
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
  const map = await getAccountMap(year);
  return studentIds.map((id) => toFeeSummary(map.get(id) ?? emptyFeeAccount(id, year)));
}

export async function saveStudentFeeAccount(account: StudentFeeAccount): Promise<StudentFeeAccount> {
  if (!isBlobStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  const year = account.academicYear || academicYear();
  const saved: StudentFeeAccount = {
    ...normalizeAccount(account, year),
    updatedAt: new Date().toISOString(),
  };

  await writeBlobJson(studentFeesBlobPath(year, saved.studentId), saved);

  const map = await getAccountMap(year, true);
  map.set(saved.studentId, saved);
  memoryAccounts = map;
  memoryAccountsAt = Date.now();
  memoryYear = year;

  return saved;
}

export async function saveStudentFeeAccounts(accounts: StudentFeeAccount[]): Promise<StudentFeeSummary[]> {
  const saved: StudentFeeSummary[] = [];
  for (const account of accounts) {
    const result = await saveStudentFeeAccount(account);
    saved.push(toFeeSummary(result));
  }
  return saved;
}
