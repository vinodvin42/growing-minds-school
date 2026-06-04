import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStudentFeeSummary } from "@/lib/student-fees-store";
import { buildFeeReceiptHtml } from "@/lib/fee-receipt";
import { getEmbeddedReceiptLogoUrl, getFeeReceiptStudent } from "@/lib/fee-receipt-server";
import { academicYear } from "@/lib/portal-storage-paths";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const studentId = new URL(request.url).searchParams.get("studentId")?.trim();
  if (!studentId) {
    return NextResponse.json({ success: false, message: "studentId is required" }, { status: 400 });
  }

  const student = await getFeeReceiptStudent(studentId);
  if (!student) {
    return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
  }

  const year = academicYear();
  const account = await getStudentFeeSummary(studentId, year);
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
