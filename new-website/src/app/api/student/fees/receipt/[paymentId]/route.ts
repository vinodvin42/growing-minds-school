import { NextResponse } from "next/server";
import { getStudentFeeSummary } from "@/lib/student-fees-store";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { buildPaymentReceiptHtml } from "@/lib/fee-receipt";
import { academicYear } from "@/lib/portal-storage-paths";

type RouteContext = { params: Promise<{ paymentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const { paymentId } = await context.params;
  const year = academicYear();
  const account = await getStudentFeeSummary(student.id, year);
  const payment = account.payments.find((p) => p.id === paymentId);

  if (!payment) {
    return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const html = buildPaymentReceiptHtml(account, payment, student, year, { baseUrl });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
