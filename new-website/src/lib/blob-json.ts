import {
  listStoragePathnames,
  readStorageJson,
  writeStorageJson,
} from "@/lib/storage/index";

/** @deprecated Prefer readStorageJson from @/lib/storage */
export async function readBlobJson<T>(pathname: string): Promise<T | null> {
  return readStorageJson<T>(pathname);
}

/** @deprecated Prefer writeStorageJson from @/lib/storage */
export async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await writeStorageJson(pathname, data);
}

/** @deprecated Prefer listStoragePathnames from @/lib/storage */
export { listStoragePathnames as listBlobPathnames };
