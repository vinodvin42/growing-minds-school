import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStudentPortalData, saveStudentPortalData } from "@/lib/student-portal-store";
import { buildHomeworkPublishLog, buildMessagesPublishLog } from "@/lib/admin-publish-log";
import { sendStudentPush } from "@/lib/web-push";
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

    const homeworkOnly = Array.isArray(body.homework);
    const messagesOnly = Array.isArray(body.messages);

    if (homeworkOnly) {
      void sendStudentPush({
        title: "New homework",
        body: "Your teacher posted homework — tap to view",
        url: "/student/homework",
      });
    }
    if (messagesOnly) {
      void sendStudentPush({
        title: "New school message",
        body: "Tap to read the latest notice",
        url: "/student/messages",
      });
    }

    const publishLog = homeworkOnly
      ? buildHomeworkPublishLog(saved.homework)
      : messagesOnly
        ? buildMessagesPublishLog(saved.messages)
        : buildHomeworkPublishLog(saved.homework);

    return NextResponse.json({ success: true, ...saved, publishLog });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export type { HomeworkItem, TeacherMessage };
