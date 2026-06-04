import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getStudentPortalData, sortByNewest } from "@/lib/student-portal-store";
import { matchesStudentAudience } from "@/types/student-portal";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const data = await getStudentPortalData();
  const homework = sortByNewest(data.homework.filter((h) => matchesStudentAudience(h, student)));
  const messages = sortByNewest(data.messages.filter((m) => matchesStudentAudience(m, student)));

  return NextResponse.json({ success: true, homework, messages });
}
