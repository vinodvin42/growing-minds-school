/** Saved student account for login screen (localStorage — not the auth session). */
export type SavedStudentAccount = {
  loginId: string;
  name: string;
  standard: string;
  section?: string;
};

const STORAGE_KEY = "gms_student_account";

export function saveStudentAccount(account: SavedStudentAccount): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    /* private mode / quota */
  }
}

export function getSavedStudentAccount(): SavedStudentAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedStudentAccount;
    if (!data?.loginId || !data?.name) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearSavedStudentAccount(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
