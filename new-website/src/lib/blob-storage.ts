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
