import fs from "fs/promises";
import path from "path";
import { images } from "@/data/images";
import { getStudentsRegistry } from "@/lib/student-store";
import { toStudentProfile } from "@/types/student";
import type { FeeReceiptStudent } from "@/lib/fee-receipt";

/** Inline logo so receipts render in print/PDF even without network. */
export async function getEmbeddedReceiptLogoUrl(): Promise<string | undefined> {
  try {
    const filePath = path.join(process.cwd(), "public", images.logo.replace(/^\//, ""));
    const buf = await fs.readFile(filePath);
    const ext = images.logo.endsWith(".png") ? "png" : "jpeg";
    return `data:image/${ext};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function getFeeReceiptStudent(studentId: string): Promise<FeeReceiptStudent | null> {
  const registry = await getStudentsRegistry();
  const record = registry.students.find((s) => s.id === studentId);
  if (!record) return null;
  return toStudentProfile(record);
}
