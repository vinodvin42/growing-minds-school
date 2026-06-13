import { get, put, list } from "@vercel/blob";
import { blobAccess, blobReadAccessModes } from "@/lib/storage/config";

export async function readBlobText(relativePath: string): Promise<string | null> {
  for (const access of blobReadAccessModes()) {
    try {
      const result = await get(relativePath, { access });
      if (result?.statusCode === 200 && result.stream) {
        return await new Response(result.stream).text();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("not found")) {
        console.error(`Blob get failed (${relativePath}, ${access}):`, error);
      }
    }
  }

  return null;
}

export async function writeBlobText(
  relativePath: string,
  text: string,
  contentType = "application/json"
): Promise<void> {
  await put(relativePath, text, {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: 60,
  });
}

export async function writeBlobBinary(
  relativePath: string,
  data: Buffer,
  contentType: string
): Promise<string> {
  const blob = await put(relativePath, data, {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
  });

  return blob.url;
}

export async function listBlobPathnames(prefix: string): Promise<string[]> {
  const pathnames: string[] = [];
  let cursor: string | undefined;
  const listPrefix = prefix.replace(/\/$/, "");

  do {
    const result = await list({ prefix: listPrefix, cursor, limit: 1000 });
    pathnames.push(...result.blobs.map((b) => b.pathname));
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return pathnames;
}

export async function readBlobFileBytes(
  pathname: string
): Promise<{ data: Buffer; contentType: string } | null> {
  for (const access of blobReadAccessModes()) {
    try {
      const result = await get(pathname, { access });
      if (result?.statusCode === 200 && result.stream) {
        const data = Buffer.from(await new Response(result.stream).arrayBuffer());
        return {
          data,
          contentType: result.blob.contentType ?? "application/octet-stream",
        };
      }
    } catch {
      // try next access mode
    }
  }
  return null;
}
