import { NextResponse } from "next/server";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import { upsertPushSubscription } from "@/lib/push-subscription-store";
import { pushConfigStatus } from "@/lib/web-push";

export async function GET() {
  return NextResponse.json({ success: true, ...pushConfigStatus() });
}

export async function POST(request: Request) {
  const student = await getCurrentStudentProfile();
  if (!student) {
    return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });
  }

  if (!pushConfigStatus().configured) {
    return NextResponse.json({ success: false, message: "Push not configured on server" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      subscription?: {
        endpoint: string;
        expirationTime?: number | null;
        keys: { p256dh: string; auth: string };
      };
    };

    const sub = body.subscription;
    if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ success: false, message: "Invalid subscription" }, { status: 400 });
    }

    await upsertPushSubscription(student.id, {
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? null,
      keys: sub.keys,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Subscribe failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
