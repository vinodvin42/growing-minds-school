/** Vercel Blob credentials: token and/or store id with platform OIDC on Vercel. */
export function isBlobStorageConfigured(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  // Newer Vercel Blob integrations expose BLOB_STORE_ID; runtime OIDC auth is provided on Vercel.
  if (process.env.BLOB_STORE_ID && process.env.VERCEL) return true;
  return false;
}

export function blobStorageErrorMessage(): string {
  return "Blob storage is not configured. In Vercel, connect a Blob store to this project, then redeploy.";
}

/**
 * Access mode for Vercel Blob read/write.
 * Public stores (used for gallery/admission images) require `"public"`.
 * Set BLOB_ACCESS=private only if your Vercel Blob store is configured as private.
 */
export function blobAccess(): "public" | "private" {
  const configured = process.env.BLOB_ACCESS?.trim().toLowerCase();
  if (configured === "private" || configured === "public") return configured;
  return "public";
}

/** Try primary access first, then legacy mode when migrating stores. */
export function blobReadAccessModes(): Array<"public" | "private"> {
  const primary = blobAccess();
  return primary === "private" ? ["private", "public"] : ["public"];
}
