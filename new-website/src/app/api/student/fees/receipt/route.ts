import { NextResponse } from "next/server";
import { getStudentFeeSummary } from "@/lib/student-fees-store";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { buildFeeReceiptHtml } from "@/lib/fee-receipt";
import { getEmbeddedReceiptLogoUrl } from "@/lib/fee-receipt-server";
import { academicYear } from "@/lib/portal-storage-paths";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const year = academicYear();
  const account = await getStudentFeeSummary(student.id, year);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const logoUrl = await getEmbeddedReceiptLogoUrl();
  const html = buildFeeReceiptHtml(account, student, year, { baseUrl, logoUrl });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
