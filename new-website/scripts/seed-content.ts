import { put } from "@vercel/blob";
import { defaultContent, CONTENT_BLOB_PATH } from "../src/data/default-content";

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Error: BLOB_READ_WRITE_TOKEN is not set.");
    console.error("Connect a Vercel Blob store, then run: npm run seed");
    process.exit(1);
  }

  const blob = await put(CONTENT_BLOB_PATH, JSON.stringify(defaultContent, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  console.log("Content seeded to Vercel Blob!");
  console.log("URL:", blob.url);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
