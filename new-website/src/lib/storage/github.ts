import {
  getGithubBranch,
  getGithubDataPrefix,
  getGithubRepo,
  getGithubToken,
  toGithubRepoPath,
} from "@/lib/storage/config";

type GithubContentFile = {
  type: "file";
  content?: string;
  encoding?: string;
  sha: string;
  path: string;
};

type GithubContentDir = {
  type: "dir";
  path: string;
};

type GithubContent = GithubContentFile | GithubContentDir;

const shaCache = new Map<string, string>();
const textCache = new Map<string, { text: string; at: number }>();
const CACHE_MS = 60_000;

function githubHeaders(): HeadersInit {
  const token = getGithubToken();
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "growing-minds-school",
  };
}

function repoApiUrl(suffix: string): string {
  const repo = getGithubRepo();
  if (!repo) throw new Error("GITHUB_REPO is not set");
  return `https://api.github.com/repos/${repo.owner}/${repo.repo}${suffix}`;
}

async function githubRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...githubHeaders(), ...init?.headers } });
  if (res.status === 404) {
    throw new Error("not found");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

function decodeContent(content: string): string {
  return Buffer.from(content, "base64").toString("utf8");
}

function encodeContent(text: string): string {
  return Buffer.from(text, "utf8").toString("base64");
}

export async function readGithubText(relativePath: string): Promise<string | null> {
  const repoPath = toGithubRepoPath(relativePath);
  if (!repoPath) return null;

  const cached = textCache.get(repoPath);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.text;
  }

  try {
    const data = await githubRequest<GithubContentFile>(
      repoApiUrl(`/contents/${repoPath.split("/").map(encodeURIComponent).join("/")}?ref=${getGithubBranch()}`)
    );
    if (data.type !== "file" || !data.content) return null;
    const text = decodeContent(data.content.replace(/\n/g, ""));
    shaCache.set(repoPath, data.sha);
    textCache.set(repoPath, { text, at: Date.now() });
    return text.trim() ? text : null;
  } catch (error) {
    if (error instanceof Error && error.message === "not found") return null;
    console.error(`GitHub read failed (${repoPath}):`, error);
    return null;
  }
}

export async function readGithubBytes(relativePath: string): Promise<Buffer | null> {
  const repoPath = toGithubRepoPath(relativePath);
  if (!repoPath) return null;

  try {
    const data = await githubRequest<GithubContentFile>(
      repoApiUrl(`/contents/${repoPath.split("/").map(encodeURIComponent).join("/")}?ref=${getGithubBranch()}`)
    );
    if (data.type !== "file" || !data.content) return null;
    shaCache.set(repoPath, data.sha);
    return Buffer.from(data.content.replace(/\n/g, ""), "base64");
  } catch (error) {
    if (error instanceof Error && error.message === "not found") return null;
    console.error(`GitHub read bytes failed (${repoPath}):`, error);
    return null;
  }
}

export async function writeGithubText(relativePath: string, text: string): Promise<void> {
  const repoPath = toGithubRepoPath(relativePath);
  if (!repoPath) throw new Error("Invalid storage path");

  let sha = shaCache.get(repoPath);
  if (!sha) {
    try {
      const existing = await githubRequest<GithubContentFile>(
        repoApiUrl(`/contents/${repoPath.split("/").map(encodeURIComponent).join("/")}?ref=${getGithubBranch()}`)
      );
      sha = existing.sha;
    } catch {
      sha = undefined;
    }
  }

  const body: Record<string, string> = {
    message: `Update ${relativePath}`,
    content: encodeContent(text),
    branch: getGithubBranch(),
  };
  if (sha) body.sha = sha;

  const result = await githubRequest<GithubContentFile>(repoApiUrl(`/contents/${repoPath.split("/").map(encodeURIComponent).join("/")}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  shaCache.set(repoPath, result.sha);
  textCache.set(repoPath, { text, at: Date.now() });
}

export async function writeGithubBinary(relativePath: string, data: Buffer): Promise<void> {
  const repoPath = toGithubRepoPath(relativePath);
  if (!repoPath) throw new Error("Invalid storage path");

  let sha = shaCache.get(repoPath);
  if (!sha) {
    try {
      const existing = await githubRequest<GithubContentFile>(
        repoApiUrl(`/contents/${repoPath.split("/").map(encodeURIComponent).join("/")}?ref=${getGithubBranch()}`)
      );
      sha = existing.sha;
    } catch {
      sha = undefined;
    }
  }

  const body: Record<string, string> = {
    message: `Upload ${relativePath}`,
    content: data.toString("base64"),
    branch: getGithubBranch(),
  };
  if (sha) body.sha = sha;

  const result = await githubRequest<GithubContentFile>(repoApiUrl(`/contents/${repoPath.split("/").map(encodeURIComponent).join("/")}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  shaCache.set(repoPath, result.sha);
  textCache.delete(repoPath);
}

export async function listGithubPathnames(prefix: string): Promise<string[]> {
  const repo = getGithubRepo();
  if (!repo) return [];

  const dataPrefix = getGithubDataPrefix();
  const listPrefix = prefix.replace(/^\/+|\/+$/g, "");
  const fullPrefix = listPrefix ? `${dataPrefix}/${listPrefix}`.replace(/\/+/g, "/") : dataPrefix;

  try {
    const branch = await githubRequest<{ commit: { sha: string } }>(
      repoApiUrl(`/branches/${encodeURIComponent(getGithubBranch())}`)
    );
    const tree = await githubRequest<{ tree: Array<{ path: string; type: string }> }>(
      repoApiUrl(`/git/trees/${branch.commit.sha}?recursive=1`)
    );

    const stripPrefix = `${dataPrefix}/`;
    return tree.tree
      .filter(
        (item) =>
          item.type === "blob" &&
          (item.path === fullPrefix ||
            item.path.startsWith(`${fullPrefix}/`) ||
            (listPrefix === "" && (item.path === dataPrefix || item.path.startsWith(`${dataPrefix}/`))))
      )
      .map((item) => item.path.slice(stripPrefix.length))
      .filter(Boolean);
  } catch (error) {
    console.error("GitHub list failed:", error);
    return [];
  }
}

export function clearGithubCache(): void {
  shaCache.clear();
  textCache.clear();
}
