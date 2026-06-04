import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { findStudentById } from "@/lib/student-store";
import { toStudentProfile, type StudentProfile } from "@/types/student";

const COOKIE_NAME = "gms_student_session";
const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret =
    process.env.STUDENT_JWT_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-student-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createStudentSession(studentId: string, loginId: string): Promise<string> {
  return new SignJWT({ role: "student", sub: studentId, loginId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());
}

export async function verifyStudentSession(token: string): Promise<{ studentId: string; loginId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "student" || typeof payload.sub !== "string") return null;
    return {
      studentId: payload.sub,
      loginId: typeof payload.loginId === "string" ? payload.loginId : "",
    };
  } catch {
    return null;
  }
}

export async function getCurrentStudentProfile(): Promise<StudentProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifyStudentSession(token);
  if (!session) return null;

  const record = await findStudentById(session.studentId);
  if (!record || !record.active) return null;

  return toStudentProfile(record);
}

export async function setStudentSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearStudentSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export { COOKIE_NAME, SESSION_DURATION };
