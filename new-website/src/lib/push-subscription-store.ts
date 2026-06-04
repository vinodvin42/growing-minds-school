import { readBlobJson, writeBlobJson } from "@/lib/blob-json";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";

const PUSH_SUBSCRIPTIONS_PATH = "portal/push/subscriptions.json";

export type StoredPushSubscription = {
  studentId: string;
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
  updatedAt: string;
};

type PushRegistry = { subscriptions: StoredPushSubscription[] };

const memory: { data: PushRegistry | null; at: number } = { data: null, at: 0 };
const TTL = 30_000;

async function load(): Promise<PushRegistry> {
  if (memory.data && Date.now() - memory.at < TTL) return memory.data;
  if (!isBlobStorageConfigured()) return { subscriptions: [] };
  const file = await readBlobJson<PushRegistry>(PUSH_SUBSCRIPTIONS_PATH);
  const data = { subscriptions: Array.isArray(file?.subscriptions) ? file.subscriptions : [] };
  memory.data = data;
  memory.at = Date.now();
  return data;
}

export async function upsertPushSubscription(
  studentId: string,
  sub: Omit<StoredPushSubscription, "studentId" | "updatedAt">
): Promise<void> {
  if (!isBlobStorageConfigured()) throw new Error(blobStorageErrorMessage());

  const registry = await load();
  const now = new Date().toISOString();
  const without = registry.subscriptions.filter(
    (s) => s.endpoint !== sub.endpoint && s.studentId !== studentId
  );
  without.push({ ...sub, studentId, updatedAt: now });
  const next = { subscriptions: without };
  await writeBlobJson(PUSH_SUBSCRIPTIONS_PATH, next);
  memory.data = next;
  memory.at = Date.now();
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  if (!isBlobStorageConfigured()) return;
  const registry = await load();
  const next = { subscriptions: registry.subscriptions.filter((s) => s.endpoint !== endpoint) };
  await writeBlobJson(PUSH_SUBSCRIPTIONS_PATH, next);
  memory.data = next;
  memory.at = Date.now();
}

export async function listPushSubscriptions(): Promise<StoredPushSubscription[]> {
  const registry = await load();
  return registry.subscriptions;
}
