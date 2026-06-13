import { readStorageText } from "@/lib/storage/index";

/** @deprecated Prefer readStorageText from @/lib/storage */
export async function readBlobJsonText(pathname: string): Promise<string | null> {
  return readStorageText(pathname);
}
