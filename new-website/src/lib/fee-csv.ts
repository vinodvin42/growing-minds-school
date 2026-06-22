import { FEE_CATEGORIES, feeUid, type FeeItemCategory, type FeeLineItem, type StudentFeeAccount } from "@/types/student-fees";

export const FEE_LINE_CSV_HEADERS = ["loginId", "label", "category", "amount", "dueDate"] as const;

const SAMPLE_ROW: Record<(typeof FEE_LINE_CSV_HEADERS)[number], string> = {
  loginId: "GMS2026001",
  label: "Term 1 Tuition",
  category: "tuition",
  amount: "15000",
  dueDate: "2026-06-15",
};

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

function normalizeCategory(raw: string): FeeItemCategory | null {
  const v = raw.trim().toLowerCase();
  if (!v) return "tuition";
  const match = FEE_CATEGORIES.find((c) => c.value === v || c.label.toLowerCase() === v);
  return match?.value ?? null;
}

function parseAmount(raw: string): number | null {
  const n = Number(raw.replace(/[,₹\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function buildFeeLineCsvTemplate(): string {
  const header = FEE_LINE_CSV_HEADERS.join(",");
  const sample = FEE_LINE_CSV_HEADERS.map((h) => escapeCsv(SAMPLE_ROW[h])).join(",");
  const categories = FEE_CATEGORIES.map((c) => c.value).join(", ");
  const note = `# One row = one fee item for a student. loginId must match Student Accounts. category: ${categories}`;
  return `${note}\n${header}\n${sample}\n`;
}

export function downloadFeeLineCsvTemplate(): void {
  const blob = new Blob([buildFeeLineCsvTemplate()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fee-items-import-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export type FeeLineCsvRow = {
  loginId: string;
  lineItem: Omit<FeeLineItem, "id">;
};

export type FeeLineCsvParseResult = {
  rows: FeeLineCsvRow[];
  errors: string[];
  skippedBlank: number;
};

export function parseFeeLineCsv(text: string): FeeLineCsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  if (lines.length === 0) {
    return { rows: [], errors: ["File is empty."], skippedBlank: 0 };
  }

  const headerCells = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const expected = FEE_LINE_CSV_HEADERS.map((h) => h.toLowerCase());
  const headerOk =
    headerCells.length >= expected.length && expected.every((h, i) => headerCells[i] === h);

  const startRow = headerOk ? 1 : 0;
  if (!headerOk && lines.length === 1 && !lines[0].includes(",")) {
    return { rows: [], errors: ["Invalid CSV header. Download the sample template and try again."], skippedBlank: 0 };
  }

  const rows: FeeLineCsvRow[] = [];
  const errors: string[] = [];
  let skippedBlank = 0;

  for (let i = startRow; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (cells.every((c) => !c.trim())) {
      skippedBlank++;
      continue;
    }

    const get = (key: (typeof FEE_LINE_CSV_HEADERS)[number], index: number) =>
      headerOk ? cells[FEE_LINE_CSV_HEADERS.indexOf(key)] ?? "" : cells[index] ?? "";

    const loginId = (headerOk ? get("loginId", 0) : cells[0] ?? "").trim();
    const label = (headerOk ? get("label", 1) : cells[1] ?? "").trim();
    const categoryRaw = (headerOk ? get("category", 2) : cells[2] ?? "tuition").trim();
    const amountRaw = (headerOk ? get("amount", 3) : cells[3] ?? "").trim();
    const dueDate = (headerOk ? get("dueDate", 4) : cells[4] ?? "").trim();

    const lineNo = i + 1;
    if (!loginId) {
      errors.push(`Row ${lineNo}: loginId is required.`);
      continue;
    }
    if (!label) {
      errors.push(`Row ${lineNo}: label is required.`);
      continue;
    }
    const category = normalizeCategory(categoryRaw);
    if (!category) {
      errors.push(`Row ${lineNo}: invalid category "${categoryRaw}".`);
      continue;
    }
    const amount = parseAmount(amountRaw);
    if (amount == null) {
      errors.push(`Row ${lineNo}: invalid amount "${amountRaw}".`);
      continue;
    }

    rows.push({
      loginId,
      lineItem: {
        label,
        category,
        amount,
        dueDate: dueDate || undefined,
      },
    });
  }

  return { rows, errors, skippedBlank };
}

export function mergeImportedFeeLines(
  accounts: StudentFeeAccount[],
  students: { id: string; loginId: string }[],
  academicYear: string,
  imported: FeeLineCsvRow[]
): { merged: StudentFeeAccount[]; added: number; skipped: number; unknownLogins: string[] } {
  const loginToId = new Map(students.map((s) => [s.loginId.trim().toLowerCase(), s.id]));
  const byStudentId = new Map(accounts.map((a) => [a.studentId, { ...a }]));
  let added = 0;
  let skipped = 0;
  const unknown = new Set<string>();
  const touched = new Set<string>();

  for (const row of imported) {
    const studentId = loginToId.get(row.loginId.trim().toLowerCase());
    if (!studentId) {
      unknown.add(row.loginId);
      skipped++;
      continue;
    }
    const existing = byStudentId.get(studentId);
    const account =
      existing ??
      ({
        studentId,
        academicYear,
        lineItems: [],
        payments: [],
        notes: "",
        updatedAt: new Date().toISOString(),
      } satisfies StudentFeeAccount);

    account.lineItems = [
      ...account.lineItems,
      { id: feeUid("fee"), ...row.lineItem },
    ];
    byStudentId.set(studentId, account);
    touched.add(studentId);
    added++;
  }

  const merged = accounts.map((a) => (touched.has(a.studentId) ? byStudentId.get(a.studentId)! : a));
  for (const id of touched) {
    if (!accounts.some((a) => a.studentId === id)) {
      merged.push(byStudentId.get(id)!);
    }
  }

  return {
    merged,
    added,
    skipped,
    unknownLogins: [...unknown],
  };
}

type FeeExportRow = {
  loginId: string;
  name: string;
  standard: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  status: string;
};

export function exportFeeSummaryCsv(rows: FeeExportRow[]): void {
  const header = ["loginId", "name", "standard", "totalDue", "totalPaid", "balance", "status"].join(",");
  const body = rows.map((r) =>
    [r.loginId, r.name, r.standard, r.totalDue, r.totalPaid, r.balance, r.status]
      .map((v) => escapeCsv(String(v)))
      .join(",")
  );
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fee-summary-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
