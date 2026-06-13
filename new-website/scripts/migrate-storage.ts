import { migrateStorageLayout, copyAllBlobFilesToStorage } from "../src/lib/storage-migrate";

const toDisk = process.argv.includes("--to-disk");

async function main() {
  console.log(toDisk ? "Copying Vercel Blob → local DATA_DIR…" : "Migrating storage layout…");

  const report = toDisk ? await copyAllBlobFilesToStorage() : await migrateStorageLayout();

  console.log(JSON.stringify(report, null, 2));

  if (!report.success) {
    process.exit(1);
  }

  console.log("\nDone.");
  if (toDisk && report.blobFilesCopied != null) {
    console.log(`Copied ${report.blobFilesCopied} file(s) to filesystem storage.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
