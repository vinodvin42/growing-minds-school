import path from "node:path";

export type StorageBackend = "filesystem" | "github";

/** Storage backends: filesystem (local dev) or github (Vercel production). */
export function storageBackend(): StorageBackend {
  const configured = process.env.STORAGE_BACKEND?.trim().toLowerCase();
  if (configured === "github" || configured === "repo") return "github";
  // Vercel serverless has a read-only filesystem — always use GitHub there.
  if (process.env.VERCEL) return "github";
  if (configured === "filesystem") return "filesystem";
  return "filesystem";
}

export function isStorageConfigured(): boolean {
  const backend = storageBackend();
  if (backend === "github") {
    return Boolean(getGithubToken() && getGithubRepo());
  }
  return !process.env.VERCEL;
}

export function storageErrorMessage(): string {
  const backend = storageBackend();
  if (backend === "github") {
    return "GitHub storage is not configured. On Vercel, set STORAGE_BACKEND=github, GITHUB_TOKEN, and GITHUB_REPO, then redeploy.";
  }
  return "File storage is not writable. Check DATA_DIR permissions.";
}

export function getDataDir(): string {
  const dir = process.env.DATA_DIR?.trim();
  return dir ? path.resolve(dir) : path.join(process.cwd(), "data");
}

export function getGithubToken(): string | null {
  return process.env.GITHUB_TOKEN?.trim() || null;
}

export function getGithubRepo(): { owner: string; repo: string } | null {
  const raw = process.env.GITHUB_REPO?.trim();
  if (!raw) return null;
  const [owner, repo] = raw.split("/");
  if (!owner || !repo) return null;
  return { owner, repo };
}

export function getGithubBranch(): string {
  return process.env.GITHUB_BRANCH?.trim() || "main";
}

export function getGithubDataPrefix(): string {
  const prefix = process.env.GITHUB_DATA_PREFIX?.trim() || "new-website/data";
  return prefix.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

export function toGithubRepoPath(relativePath: string): string | null {
  const safe = sanitizeStoragePath(relativePath);
  if (!safe) return null;
  return `${getGithubDataPrefix()}/${safe}`.replace(/\/+/g, "/");
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
