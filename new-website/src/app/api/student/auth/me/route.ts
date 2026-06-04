import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";

export async function GET() {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({ success: true, student });
}
