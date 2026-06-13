import fs from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import {
  getDataDir,
  getGithubRepo,
  getGithubToken,
  isStorageConfigured,
  storageBackend,
} from "@/lib/storage/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const backend = storageBackend();
  const dataDir = getDataDir();

  let dataDirWritable = false;
  if (backend === "filesystem") {
    try {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.access(dataDir, fsConstants.W_OK);
      dataDirWritable = true;
    } catch {
      dataDirWritable = false;
    }
  }

  const ok = isStorageConfigured() && (backend !== "filesystem" || dataDirWritable);

  const repoInfo = getGithubRepo();

  return Response.json(
    {
      ok,
      backend,
      github:
        backend === "github"
          ? { repo: repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : null, tokenSet: Boolean(getGithubToken()) }
          : undefined,
      dataDir: backend === "filesystem" ? dataDir : undefined,
      dataDirWritable: backend === "filesystem" ? dataDirWritable : undefined,
    },
    { status: ok ? 200 : 503 }
  );
}
