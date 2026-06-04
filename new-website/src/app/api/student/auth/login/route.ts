import { NextResponse } from "next/server";
import { findStudentByLoginId } from "@/lib/student-store";
import { verifyPassword } from "@/lib/password";
import { createStudentSession, COOKIE_NAME, SESSION_DURATION } from "@/lib/student-auth";
import { toStudentProfile } from "@/types/student";

export async function POST(request: Request) {
  try {
    const { loginId, password } = (await request.json()) as { loginId?: string; password?: string };

    if (!loginId?.trim() || !password) {
      return NextResponse.json({ success: false, message: "Student ID and password are required" }, { status: 400 });
    }

    const student = await findStudentByLoginId(loginId);
    if (!student || !student.active) {
      return NextResponse.json({ success: false, message: "Invalid student ID or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, student.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid student ID or password" }, { status: 401 });
    }

    const token = await createStudentSession(student.id, student.loginId);

    const response = NextResponse.json({
      success: true,
      student: toStudentProfile(student),
    });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 });
  }
}
