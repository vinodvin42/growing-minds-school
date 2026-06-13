import fs from "node:fs/promises";
import path from "node:path";

const dataDir = process.env.DATA_DIR?.trim()
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

const dirs = [
  dataDir,
  path.join(dataDir, "portal"),
  path.join(dataDir, "uploads"),
  path.join(dataDir, "admissions"),
];

for (const dir of dirs) {
  await fs.mkdir(dir, { recursive: true });
}

console.log(`Storage ready: ${dataDir}`);
