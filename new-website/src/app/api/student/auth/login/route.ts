import { NextResponse } from "next/server";
import { findStudentByLoginId } from "@/lib/student-store";
import { verifyPassword } from "@/lib/password";
import { createStudentSession, COOKIE_NAME, SESSION_DURATION } from "@/lib/student-auth";
import { toStudentProfile } from "@/types/student";

export async function POST(request: Request) {
  try {
    const { loginId, password } = (await request.json()) as { loginId?: string; password?: string };
    const id = loginId?.trim() ?? "";
    const pass = password?.trim() ?? "";

    if (!id || !pass) {
      return NextResponse.json({ success: false, message: "Student ID and password are required" }, { status: 400 });
    }

    const student = await findStudentByLoginId(id);
    if (!student || !student.active) {
      return NextResponse.json(
        { success: false, message: "Invalid student ID or password. Check with your teacher if this is a new account." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(pass, student.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid student ID or password. Check caps lock and try again." },
        { status: 401 }
      );
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
  } catch (err) {
    console.error("Student login error:", err);
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 });
  }
}
