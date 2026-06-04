import webpush from "web-push";
import { listPushSubscriptions, removePushSubscription } from "@/lib/push-subscription-store";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

function isPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
  );
}

function configureVapid(): boolean {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:growingmindsenglishschool@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
  return true;
}

export async function sendStudentPush(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!configureVapid()) {
    console.warn("[Push] VAPID keys not configured — skip push");
    return { sent: 0, failed: 0 };
  }

  const subs = await listPushSubscriptions();
  let sent = 0;
  let failed = 0;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/student/dashboard",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            expirationTime: sub.expirationTime ?? undefined,
            keys: sub.keys,
          },
          body
        );
        sent += 1;
      } catch (err) {
        failed += 1;
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await removePushSubscription(sub.endpoint);
        }
        console.warn("[Push] send failed:", status, sub.endpoint.slice(0, 48));
      }
    })
  );

  return { sent, failed };
}

export function pushConfigStatus() {
  return {
    configured: isPushConfigured(),
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || null,
  };
}
