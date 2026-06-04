import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStudentCalendarData, saveStudentCalendarData } from "@/lib/student-calendar-store";
import { sendStudentPush } from "@/lib/web-push";
import { academicYear, PORTAL_ROOT } from "@/lib/portal-storage-paths";
import type { StudentCalendarData } from "@/types/student-calendar";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const year = academicYear();
  const data = await getStudentCalendarData(year);

  return NextResponse.json({
    success: true,
    academicYear: year,
    ...data,
    storage: {
      holidays: `${PORTAL_ROOT}/${year}/calendar/holidays.json`,
      reminders: `${PORTAL_ROOT}/${year}/calendar/reminders.json`,
    },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<StudentCalendarData>;
    const year = academicYear();
    const existing = await getStudentCalendarData(year, { fresh: true });

    const saved = await saveStudentCalendarData(
      {
        holidays: Array.isArray(body.holidays) ? body.holidays : existing.holidays,
        reminders: Array.isArray(body.reminders) ? body.reminders : existing.reminders,
      },
      year
    );

    void sendStudentPush({
      title: "Calendar updated",
      body: "New holiday or reminder — tap to view",
      url: "/student/calendar",
    });

    return NextResponse.json({ success: true, academicYear: year, ...saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save calendar";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
