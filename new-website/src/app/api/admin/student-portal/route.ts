import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStudentPortalData, saveStudentPortalData } from "@/lib/student-portal-store";
import type { HomeworkItem, StudentPortalData, TeacherMessage } from "@/types/student-portal";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const data = await getStudentPortalData();
  return NextResponse.json({ success: true, ...data });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<StudentPortalData>;
    const homework = Array.isArray(body.homework) ? body.homework : [];
    const messages = Array.isArray(body.messages) ? body.messages : [];

    await saveStudentPortalData({ homework, messages });
    const saved = await getStudentPortalData();

    return NextResponse.json({ success: true, ...saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export type { HomeworkItem, TeacherMessage };
