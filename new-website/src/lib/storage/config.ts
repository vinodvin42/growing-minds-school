import path from "node:path";

export type StorageBackend = "filesystem" | "blob";

/** Default is filesystem. Set STORAGE_BACKEND=blob only for legacy Vercel Blob deployments. */
export function storageBackend(): StorageBackend {
  const configured = process.env.STORAGE_BACKEND?.trim().toLowerCase();
  if (configured === "blob") return "blob";
  return "filesystem";
}

export function isStorageConfigured(): boolean {
  if (storageBackend() === "filesystem") return true;
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL));
}

export function storageErrorMessage(): string {
  if (storageBackend() === "filesystem") {
    return "File storage is not writable. Check DATA_DIR permissions.";
  }
  return "Blob storage is not configured. Connect a Blob store or set STORAGE_BACKEND=filesystem with a persistent DATA_DIR.";
}

/** Root folder for JSON and uploads when using filesystem backend. */
export function getDataDir(): string {
  const dir = process.env.DATA_DIR?.trim();
  return dir ? path.resolve(dir) : path.join(process.cwd(), "data");
}

export function storagePublicUrl(relativePath: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const encoded = relativePath
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return base ? `${base}/api/storage/${encoded}` : `/api/storage/${encoded}`;
}

/** Prevent path traversal — returns null if unsafe. */
export function sanitizeStoragePath(relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;
  return normalized;
}

export function toAbsoluteStoragePath(relativePath: string): string | null {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) return null;
  return path.join(getDataDir(), safe);
}

/** Legacy blob helpers — only used when STORAGE_BACKEND=blob */
export function blobAccess(): "public" | "private" {
  const configured = process.env.BLOB_ACCESS?.trim().toLowerCase();
  if (configured === "private" || configured === "public") return configured;
  return "public";
}

export function blobReadAccessModes(): Array<"public" | "private"> {
  const primary = blobAccess();
  return primary === "private" ? ["private", "public"] : ["public"];
}

/** @deprecated Use isStorageConfigured */
export function isBlobStorageConfigured(): boolean {
  return storageBackend() === "blob" && isStorageConfigured();
}

/** @deprecated Use storageErrorMessage */
export function blobStorageErrorMessage(): string {
  return storageErrorMessage();
}
