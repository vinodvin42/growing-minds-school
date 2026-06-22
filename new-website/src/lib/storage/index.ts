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

  if (storageBackend() === "github") {
    const { readGithubText } = await import("@/lib/storage/github");
    return readGithubText(safe);
  }

  const abs = toAbsoluteStoragePath(safe);
  if (!abs) return null;
  try {
    const text = await fs.readFile(abs, "utf8");
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

export async function writeStorageText(relativePath: string, text: string, contentType = "application/json"): Promise<void> {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) throw new Error("Invalid storage path");

  if (storageBackend() === "github") {
    const { writeGithubText } = await import("@/lib/storage/github");
    await writeGithubText(safe, text);
    return;
  }

  const abs = toAbsoluteStoragePath(safe);
  if (!abs) throw new Error("Invalid storage path");
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, text, "utf8");
}

export async function writeStorageBinary(
  relativePath: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) throw new Error("Invalid storage path");

  const body = Buffer.isBuffer(data) ? data : Buffer.from(data);

  if (storageBackend() === "github") {
    const { writeGithubBinary } = await import("@/lib/storage/github");
    await writeGithubBinary(safe, body);
    return storagePublicUrl(safe);
  }

  const abs = toAbsoluteStoragePath(safe);
  if (!abs) throw new Error("Invalid storage path");
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, body);
  return storagePublicUrl(safe);
}

export async function listStoragePathnames(prefix: string): Promise<string[]> {
  const safePrefix = sanitizeStoragePath(prefix.replace(/\/$/, "") + "/");
  if (!safePrefix) return [];

  if (storageBackend() === "github") {
    const { listGithubPathnames } = await import("@/lib/storage/github");
    return listGithubPathnames(safePrefix.replace(/\/$/, ""));
  }

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

export async function writeStorageBatch(
  files: { relativePath: string; text: string }[],
  commitMessage?: string
): Promise<void> {
  if (files.length === 0) return;

  const prepared = files.map((file) => {
    const safe = sanitizeStoragePath(file.relativePath);
    if (!safe) throw new Error(`Invalid storage path: ${file.relativePath}`);
    return { relativePath: safe, text: file.text };
  });

  if (storageBackend() === "github") {
    const { writeGithubBatch } = await import("@/lib/storage/github");
    const label =
      commitMessage ??
      (prepared.length === 1 ? `Update ${prepared[0].relativePath}` : `Update ${prepared.length} data files`);
    await writeGithubBatch(prepared, label);
    return;
  }

  for (const file of prepared) {
    await writeStorageText(file.relativePath, file.text);
  }
}

export async function writeStorageJsonBatch(
  files: { relativePath: string; data: unknown }[],
  commitMessage?: string
): Promise<void> {
  await writeStorageBatch(
    files.map((file) => ({
      relativePath: file.relativePath,
      text: JSON.stringify(file.data, null, 2),
    })),
    commitMessage
  );
}

export async function readStorageBytes(relativePath: string): Promise<Buffer | null> {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) return null;

  if (storageBackend() === "github") {
    const { readGithubBytes } = await import("@/lib/storage/github");
    return readGithubBytes(safe);
  }

  const abs = toAbsoluteStoragePath(safe);
  if (!abs) return null;
  try {
    return await fs.readFile(abs);
  } catch {
    return null;
  }
}
