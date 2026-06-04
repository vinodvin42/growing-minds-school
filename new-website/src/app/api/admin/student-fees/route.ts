import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStudentsRegistry } from "@/lib/student-store";
import { getAllStudentFeeSummaries, saveStudentFeeAccounts } from "@/lib/student-fees-store";
import { sendStudentPush } from "@/lib/web-push";
import { academicYear, PORTAL_ROOT } from "@/lib/portal-storage-paths";
import type { StudentFeeAccount } from "@/types/student-fees";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const year = academicYear();
  const registry = await getStudentsRegistry();
  const studentIds = registry.students.map((s) => s.id);
  const accounts = await getAllStudentFeeSummaries(studentIds, year);

  return NextResponse.json({
    success: true,
    academicYear: year,
    accounts,
    students: registry.students.map((s) => ({
      id: s.id,
      loginId: s.loginId,
      name: s.name,
      standard: s.standard,
      section: s.section,
      rollNumber: s.rollNumber,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail,
    })),
    storage: {
      layout: `${PORTAL_ROOT}/{year}/accounts/{studentId}.json`,
      example: `${PORTAL_ROOT}/${year}/accounts/stu_abc123.json`,
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { accounts?: StudentFeeAccount[] };
    if (!Array.isArray(body.accounts)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const year = academicYear();
    const normalized = body.accounts.map((account) => ({
      ...account,
      academicYear: account.academicYear || year,
      lineItems: Array.isArray(account.lineItems) ? account.lineItems : [],
      payments: Array.isArray(account.payments) ? account.payments : [],
    }));

    const saved = await saveStudentFeeAccounts(normalized);
    void sendStudentPush({
      title: "Fees updated",
      body: "Your fee account was updated — tap to view",
      url: "/student/fees",
    });
    return NextResponse.json({ success: true, accounts: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save fees";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
