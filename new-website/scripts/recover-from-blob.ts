/**
 * One-time recovery: copy all files from Vercel Blob → GitHub JSON storage.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=vercel_blob_xxx npm run recover:from-blob
 *
 * Get the token from the OLD Vercel project → Storage → .env.local tab
 * (the account that hosted growingmindsschool.org with Blob connected).
 */
import { list, get } from "@vercel/blob";
import { writeStorageBinary, writeStorageText } from "../src/lib/storage/index";
import { clearPortalManifestCache, bootstrapPortalManifestFromStorage, savePortalManifest } from "../src/lib/portal-manifest";

async function listAllBlobs(): Promise<Array<{ pathname: string; url: string; downloadUrl: string }>> {
  const blobs: Array<{ pathname: string; url: string; downloadUrl: string }> = [];
  let cursor: string | undefined;

  do {
    const result = await list({ cursor, limit: 1000 });
    for (const b of result.blobs) {
      blobs.push({ pathname: b.pathname, url: b.url, downloadUrl: b.downloadUrl });
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return blobs;
}

async function readBytes(blob: {
  pathname: string;
  url: string;
  downloadUrl: string;
}): Promise<{ data: Buffer; contentType: string } | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN!;
  const candidates = [blob.downloadUrl, blob.url];

  for (const url of candidates) {
    try {
      const result = await get(url, { access: "public", token });
      if (result?.statusCode === 200 && result.stream) {
        const data = Buffer.from(await new Response(result.stream).arrayBuffer());
        return { data, contentType: result.blob.contentType ?? "application/octet-stream" };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("403") || message.includes("blocked")) {
        const probe = await fetch(blob.url, { headers: { Authorization: `Bearer ${token}` } });
        const body = await probe.text();
        if (body.includes("blocked")) {
          throw new Error(
            "Vercel Blob store is BLOCKED (quota/billing). Unblock it in Vercel → Storage → your Blob store, then re-run this script."
          );
        }
      }
    }
  }

  for (const access of ["public", "private"] as const) {
    try {
      const result = await get(blob.pathname, { access, token });
      if (result?.statusCode === 200 && result.stream) {
        const data = Buffer.from(await new Response(result.stream).arrayBuffer());
        return { data, contentType: result.blob.contentType ?? "application/octet-stream" };
      }
    } catch {
      // try next access mode
    }
  }

  return null;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN to read from Vercel Blob.");
    process.exit(1);
  }

  process.env.STORAGE_BACKEND = "github";
  if (!process.env.GITHUB_TOKEN) {
    console.error("Set GITHUB_TOKEN (and GITHUB_REPO) to write recovered data.");
    process.exit(1);
  }

  console.log("Listing Blob files…");
  const blobs = await listAllBlobs();
  console.log(`Found ${blobs.length} file(s) in Blob.`);

  let copied = 0;
  const errors: string[] = [];

  for (const blob of blobs) {
    let file: { data: Buffer; contentType: string } | null = null;
    try {
      file = await readBytes(blob);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    }

    if (!file) {
      errors.push(`Could not read: ${blob.pathname}`);
      continue;
    }

    if (file.contentType.includes("json") || blob.pathname.endsWith(".json")) {
      await writeStorageText(blob.pathname, file.data.toString("utf8"), file.contentType);
    } else {
      await writeStorageBinary(blob.pathname, file.data, file.contentType);
    }
    copied++;
    console.log(`  ✓ ${blob.pathname}`);
  }

  clearPortalManifestCache();
  const manifest = await bootstrapPortalManifestFromStorage();
  await savePortalManifest(manifest);

  console.log(`\nCopied ${copied} file(s) to GitHub storage.`);
  if (errors.length) {
    console.error("Errors:", errors);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
