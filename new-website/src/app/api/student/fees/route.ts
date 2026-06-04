import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getStudentFeeSummary } from "@/lib/student-fees-store";
import { academicYear } from "@/lib/portal-storage-paths";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const year = academicYear();
  const account = await getStudentFeeSummary(student.id, year);

  return NextResponse.json({
    success: true,
    academicYear: year,
    account,
    student: {
      name: student.name,
      loginId: student.loginId,
      standard: student.standard,
      section: student.section,
      rollNumber: student.rollNumber,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail,
    },
  });
}
