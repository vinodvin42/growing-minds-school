import { defaultContent, CONTENT_PATH } from "../src/data/default-content";
import { writeStorageJson } from "../src/lib/storage/index";

async function main() {
  await writeStorageJson(CONTENT_PATH, defaultContent);
  console.log("Content seeded to storage:", CONTENT_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
