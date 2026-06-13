import fs from "node:fs/promises";
import path from "node:path";
import {
  getDataDir,
  sanitizeStoragePath,
  storageBackend,
  storagePublicUrl,
  toAbsoluteStoragePath,
} from "@/lib/storage/config";

export async function readStorageText(relativePath: string): Promise<string | null> {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) return null;

  if (storageBackend() === "filesystem") {
    const abs = toAbsoluteStoragePath(safe);
    if (!abs) return null;
    try {
      const text = await fs.readFile(abs, "utf8");
      return text.trim() ? text : null;
    } catch {
      return null;
    }
  }

  const { readBlobText } = await import("@/lib/storage/blob");
  return readBlobText(safe);
}

export async function writeStorageText(relativePath: string, text: string, contentType = "application/json"): Promise<void> {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) throw new Error("Invalid storage path");

  if (storageBackend() === "filesystem") {
    const abs = toAbsoluteStoragePath(safe);
    if (!abs) throw new Error("Invalid storage path");
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, text, "utf8");
    return;
  }

  const { writeBlobText } = await import("@/lib/storage/blob");
  await writeBlobText(safe, text, contentType);
}

export async function writeStorageBinary(
  relativePath: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) throw new Error("Invalid storage path");

  if (storageBackend() === "filesystem") {
    const abs = toAbsoluteStoragePath(safe);
    if (!abs) throw new Error("Invalid storage path");
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, data);
    return storagePublicUrl(safe);
  }

  const body = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const { writeBlobBinary } = await import("@/lib/storage/blob");
  return writeBlobBinary(safe, body, contentType);
}

export async function listStoragePathnames(prefix: string): Promise<string[]> {
  const safePrefix = sanitizeStoragePath(prefix.replace(/\/$/, "") + "/");
  if (!safePrefix) return [];

  if (storageBackend() === "filesystem") {
    const base = getDataDir();
    const start = toAbsoluteStoragePath(safePrefix);
    if (!start) return [];

    const prefixNorm = safePrefix.replace(/\/$/, "");
    const results: string[] = [];

    async function walk(absDir: string): Promise<void> {
      let entries;
      try {
        entries = await fs.readdir(absDir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const abs = path.join(absDir, entry.name);
        const rel = path.relative(base, abs).replace(/\\/g, "/");
        if (entry.isDirectory()) {
          await walk(abs);
        } else {
          results.push(rel);
        }
      }
    }

    await walk(start);
    return results.filter((p) => p.startsWith(prefixNorm));
  }

  const { listBlobPathnames } = await import("@/lib/storage/blob");
  return listBlobPathnames(safePrefix.replace(/\/$/, ""));
}

export async function readStorageJson<T>(relativePath: string): Promise<T | null> {
  const text = await readStorageText(relativePath);
  if (!text?.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    console.error(`Invalid JSON at ${relativePath}`);
    return null;
  }
}

export async function writeStorageJson(relativePath: string, data: unknown): Promise<void> {
  await writeStorageText(relativePath, JSON.stringify(data, null, 2));
}
