import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { readStorageBytes } from "@/lib/storage/index";
import { storageBackend, toAbsoluteStoragePath } from "@/lib/storage/config";

const PUBLIC_PREFIXES = ["uploads/", "admissions/"];

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
};

type RouteContext = { params: Promise<{ path: string[] }> };

/** Serve uploaded files (filesystem or GitHub-backed storage on Vercel). */
export async function GET(_request: Request, context: RouteContext) {
  const backend = storageBackend();
  if (backend === "blob") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const segments = (await context.params).path;
  const relativePath = segments.map(decodeURIComponent).join("/");

  if (!PUBLIC_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let data: Buffer | null = null;

  if (backend === "filesystem") {
    const abs = toAbsoluteStoragePath(relativePath);
    if (!abs) {
      return NextResponse.json({ message: "Invalid path" }, { status: 400 });
    }
    try {
      data = await fs.readFile(abs);
    } catch {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
  } else {
    data = await readStorageBytes(relativePath);
    if (!data) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
  }

  const ext = path.extname(relativePath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
