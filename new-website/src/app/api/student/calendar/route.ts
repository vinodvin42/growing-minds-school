import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getCalendarForStudent } from "@/lib/student-calendar-store";
import { academicYear } from "@/lib/portal-storage-paths";
import { sortByDateAsc, upcomingHolidays, upcomingReminders } from "@/types/student-calendar";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const year = academicYear();
  const data = await getCalendarForStudent(student, year);

  return NextResponse.json({
    success: true,
    academicYear: year,
    holidays: sortByDateAsc(data.holidays),
    reminders: sortByDateAsc(data.reminders),
    upcoming: {
      holidays: upcomingHolidays(data.holidays, 5),
      reminders: upcomingReminders(data.reminders, 5),
    },
  });
}
