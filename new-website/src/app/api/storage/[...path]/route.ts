import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
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

/** Serve uploaded files when STORAGE_BACKEND=filesystem */
export async function GET(_request: Request, context: RouteContext) {
  if (storageBackend() !== "filesystem") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const segments = (await context.params).path;
  const relativePath = segments.map(decodeURIComponent).join("/");

  if (!PUBLIC_PREFIXES.some((prefix) => relativePath.startsWith(prefix))) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const abs = toAbsoluteStoragePath(relativePath);
  if (!abs) {
    return NextResponse.json({ message: "Invalid path" }, { status: 400 });
  }

  try {
    const data = await fs.readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    const contentType = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}
