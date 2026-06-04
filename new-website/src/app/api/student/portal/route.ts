import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { getStudentPortalDataForStudent, sortByNewest } from "@/lib/student-portal-store";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const data = await getStudentPortalDataForStudent(student);
  const homework = sortByNewest(data.homework);
  const messages = sortByNewest(data.messages);

  return NextResponse.json({ success: true, homework, messages });
}
