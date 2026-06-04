import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getStudentsRegistry,
  mergeStudentInputs,
  saveStudentsRegistry,
} from "@/lib/student-store";
import { academicYear, PORTAL_ROOT } from "@/lib/portal-storage-paths";
import { toStudentProfile, type StudentAdminInput } from "@/types/student";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const registry = await getStudentsRegistry();
  return NextResponse.json({
    success: true,
    students: registry.students.map(toStudentProfile),
    storage: {
      layout: `${PORTAL_ROOT}/{year}/classes/{class}/students.json`,
      example: `${PORTAL_ROOT}/${academicYear()}/classes/3rd-standard/students.json`,
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { students?: StudentAdminInput[] };
    if (!Array.isArray(body.students)) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const loginIds = body.students.map((s) => s.loginId.trim().toLowerCase());
    if (new Set(loginIds).size !== loginIds.length) {
      return NextResponse.json({ success: false, message: "Duplicate student IDs are not allowed" }, { status: 400 });
    }

    const existing = await getStudentsRegistry({ fresh: true });
    const merged = await mergeStudentInputs(existing.students, body.students);
    await saveStudentsRegistry({ students: merged });

    return NextResponse.json({
      success: true,
      students: merged.map(toStudentProfile),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save students";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
