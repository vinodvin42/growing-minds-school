import { list, put } from "@vercel/blob";
import { readBlobJsonText } from "@/lib/blob-read";
import { blobAccess } from "@/lib/blob-storage";

export async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function readBlobJson<T>(pathname: string): Promise<T | null> {
  const text = await readBlobJsonText(pathname);
  if (!text?.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`Invalid JSON at ${pathname}`);
    return null;
  }
}

/** List all blob pathnames under a prefix (paginated). */
export async function listBlobPathnames(prefix: string): Promise<string[]> {
  const pathnames: string[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({ prefix, cursor, limit: 1000 });
    pathnames.push(...result.blobs.map((b) => b.pathname));
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return pathnames;
}
