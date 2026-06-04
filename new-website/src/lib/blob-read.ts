import { list, get } from "@vercel/blob";
import { blobReadAccessModes } from "@/lib/blob-storage";

/** Read JSON blob text — SDK stream first, then cache-busted public URL. */
export async function readBlobJsonText(pathname: string): Promise<string | null> {
  for (const access of blobReadAccessModes()) {
    try {
      const result = await get(pathname, { access });
      if (result?.statusCode === 200 && result.stream) {
        return await new Response(result.stream).text();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("not found")) {
        console.error(`Blob get failed (${pathname}, ${access}):`, error);
      }
    }
  }

  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const blob = blobs.find((b) => b.pathname === pathname);
    if (!blob?.url) return null;

    const res = await fetch(`${blob.url}?v=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (error) {
    console.error(`Blob list/fetch failed (${pathname}):`, error);
    return null;
  }
}
