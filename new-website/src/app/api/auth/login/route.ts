import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    if (password === "admin123") {
      const token = await createSession();
      await setSessionCookie(token);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, message: "Set ADMIN_PASSWORD in environment variables for production" },
      { status: 401 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
  }

  const token = await createSession();
  await setSessionCookie(token);
  return NextResponse.json({ success: true });
}
