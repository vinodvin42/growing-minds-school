import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStudentPortalData, saveStudentPortalData } from "@/lib/student-portal-store";
import { PORTAL_ROOT } from "@/lib/portal-storage-paths";
import type { HomeworkItem, StudentPortalData, TeacherMessage } from "@/types/student-portal";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const data = await getStudentPortalData();
  return NextResponse.json({
    success: true,
    ...data,
    storage: {
      homeworkLayout: `${PORTAL_ROOT}/{year}/classes/{class}/homework.json`,
      exampleHomework: `${PORTAL_ROOT}/2026/classes/3rd-standard/homework.json`,
      messagesLayout: `${PORTAL_ROOT}/{year}/{month}/messages.json`,
      exampleMessages: `${PORTAL_ROOT}/2026/06/messages.json`,
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<StudentPortalData>;
    const existing = await getStudentPortalData({ fresh: true });
    const homework = Array.isArray(body.homework) ? body.homework : existing.homework;
    const messages = Array.isArray(body.messages) ? body.messages : existing.messages;

    const saved = await saveStudentPortalData({ homework, messages });

    return NextResponse.json({ success: true, ...saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export type { HomeworkItem, TeacherMessage };
