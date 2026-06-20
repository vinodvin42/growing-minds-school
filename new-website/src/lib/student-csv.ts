import { STUDENT_STANDARDS, type StudentAdminInput } from "@/types/student";

export const STUDENT_CSV_HEADERS = [
  "loginId",
  "password",
  "name",
  "standard",
  "section",
  "rollNumber",
  "parentName",
  "parentPhone",
  "parentEmail",
  "active",
] as const;

const SAMPLE_ROW: Record<(typeof STUDENT_CSV_HEADERS)[number], string> = {
  loginId: "GMS2026001",
  password: "",
  name: "Demo Student",
  standard: "Nursery",
  section: "A",
  rollNumber: "1",
  parentName: "Parent Name",
  parentPhone: "+91 9876543210",
  parentEmail: "parent@example.com",
  active: "yes",
};

function uid() {
  return `stu_${Math.random().toString(36).slice(2, 11)}`;
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseActive(raw: string): boolean {
  const v = raw.trim().toLowerCase();
  if (!v || v === "yes" || v === "y" || v === "true" || v === "1" || v === "active") return true;
  if (v === "no" || v === "n" || v === "false" || v === "0" || v === "inactive") return false;
  return true;
}

function normalizeStandard(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const exact = STUDENT_STANDARDS.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;
  const aliases: Record<string, string> = {
    nursery: "Nursery",
    lkg: "LKG",
    ukg: "UKG",
    "1st": "1st Standard",
    "1st standard": "1st Standard",
    "2nd": "2nd Standard",
    "2nd standard": "2nd Standard",
    "3rd": "3rd Standard",
    "3rd standard": "3rd Standard",
    "4th": "4th Standard",
    "4th standard": "4th Standard",
    "5th": "5th Standard",
    "5th standard": "5th Standard",
    "6th": "6th Standard",
    "6th standard": "6th Standard",
    "7th": "7th Standard",
    "7th standard": "7th Standard",
    "8th": "8th Standard",
    "8th standard": "8th Standard",
  };
  return aliases[trimmed.toLowerCase()] ?? null;
}

export function buildStudentCsvTemplate(): string {
  const header = STUDENT_CSV_HEADERS.join(",");
  const sample = STUDENT_CSV_HEADERS.map((h) => escapeCsv(SAMPLE_ROW[h])).join(",");
  const note =
    "# Leave password blank for default (student123). active: yes/no. standard: Nursery, LKG, UKG, 1st Standard, etc.";
  return `${note}\n${header}\n${sample}\n`;
}

export function downloadStudentCsvTemplate(): void {
  const blob = new Blob([buildStudentCsvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export type StudentCsvParseResult = {
  rows: StudentAdminInput[];
  errors: string[];
  skippedBlank: number;
};

export function parseStudentCsv(text: string): StudentCsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (lines.length === 0) {
    return { rows: [], errors: ["File is empty."], skippedBlank: 0 };
  }

  const headerCells = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const expected = STUDENT_CSV_HEADERS.map((h) => h.toLowerCase());
  const headerOk =
    headerCells.length === expected.length && expected.every((h, i) => headerCells[i] === h);

  const startRow = headerOk ? 1 : 0;
  if (!headerOk && lines.length === 1 && !lines[0].includes(",")) {
    return { rows: [], errors: ["Invalid CSV header. Download the sample template and try again."], skippedBlank: 0 };
  }

  const rows: StudentAdminInput[] = [];
  const errors: string[] = [];
  let skippedBlank = 0;

  for (let i = startRow; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.every((c) => !c.trim())) {
      skippedBlank++;
      continue;
    }

    const get = (key: (typeof STUDENT_CSV_HEADERS)[number], index: number) =>
      headerOk ? cells[STUDENT_CSV_HEADERS.indexOf(key)] ?? "" : cells[index] ?? "";

    const loginId = (headerOk ? get("loginId", 0) : cells[0] ?? "").trim();
    const password = (headerOk ? get("password", 1) : cells[1] ?? "").trim();
    const name = (headerOk ? get("name", 2) : cells[2] ?? "").trim();
    const standardRaw = (headerOk ? get("standard", 3) : cells[3] ?? "").trim();
    const section = (headerOk ? get("section", 4) : cells[4] ?? "").trim();
    const rollNumber = (headerOk ? get("rollNumber", 5) : cells[5] ?? "").trim();
    const parentName = (headerOk ? get("parentName", 6) : cells[6] ?? "").trim();
    const parentPhone = (headerOk ? get("parentPhone", 7) : cells[7] ?? "").trim();
    const parentEmail = (headerOk ? get("parentEmail", 8) : cells[8] ?? "").trim();
    const activeRaw = headerOk ? get("active", 9) : cells[9] ?? "yes";

    const lineNo = i + 1;
    if (!loginId) {
      errors.push(`Row ${lineNo}: loginId is required.`);
      continue;
    }
    if (!name) {
      errors.push(`Row ${lineNo}: name is required.`);
      continue;
    }
    const standard = normalizeStandard(standardRaw);
    if (!standard) {
      errors.push(`Row ${lineNo}: invalid standard "${standardRaw}".`);
      continue;
    }
    if (!parentName) {
      errors.push(`Row ${lineNo}: parentName is required.`);
      continue;
    }
    if (!parentPhone) {
      errors.push(`Row ${lineNo}: parentPhone is required.`);
      continue;
    }

    rows.push({
      id: uid(),
      loginId,
      password: password || undefined,
      name,
      standard,
      section: section || undefined,
      rollNumber: rollNumber || undefined,
      parentName,
      parentPhone,
      parentEmail: parentEmail || undefined,
      active: parseActive(activeRaw),
    });
  }

  const seen = new Set<string>();
  for (const row of rows) {
    const key = row.loginId.trim().toLowerCase();
    if (seen.has(key)) {
      errors.push(`Duplicate loginId in file: ${row.loginId}`);
    }
    seen.add(key);
  }

  return { rows, errors, skippedBlank };
}

export function mergeImportedStudents(
  existing: StudentAdminInput[],
  imported: StudentAdminInput[]
): { merged: StudentAdminInput[]; added: number; updated: number } {
  const byLoginId = new Map(existing.map((s) => [s.loginId.trim().toLowerCase(), s]));
  let added = 0;
  let updated = 0;

  for (const row of imported) {
    const key = row.loginId.trim().toLowerCase();
    const prev = byLoginId.get(key);
    if (prev) {
      byLoginId.set(key, {
        ...prev,
        ...row,
        id: prev.id,
        password: row.password?.trim() ? row.password : prev.password,
      });
      updated++;
    } else {
      byLoginId.set(key, row);
      added++;
    }
  }

  return { merged: [...byLoginId.values()], added, updated };
}

export function filterStudents(
  students: StudentAdminInput[],
  options: { query: string; standard: string; status: "all" | "active" | "inactive" }
): StudentAdminInput[] {
  const q = options.query.trim().toLowerCase();
  return students.filter((s) => {
    if (options.standard !== "all" && s.standard !== options.standard) return false;
    if (options.status === "active" && !s.active) return false;
    if (options.status === "inactive" && s.active) return false;
    if (!q) return true;
    const haystack = [s.loginId, s.name, s.rollNumber, s.parentName, s.parentPhone, s.standard, s.section]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function exportStudentsCsv(students: StudentAdminInput[]): void {
  const header = STUDENT_CSV_HEADERS.join(",");
  const body = students.map((s) =>
    STUDENT_CSV_HEADERS.map((h) => {
      if (h === "password") return "";
      if (h === "active") return s.active ? "yes" : "no";
      const v = s[h];
      return escapeCsv(v == null ? "" : String(v));
    }).join(",")
  );
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
