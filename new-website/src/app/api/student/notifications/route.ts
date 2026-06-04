import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { buildStudentNotifications } from "@/lib/student-notifications";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  const items = await buildStudentNotifications(student);
  return NextResponse.json({ success: true, items });
}
