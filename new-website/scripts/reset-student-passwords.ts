/**
 * Reset every student password to the default (student123).
 * Usage: STORAGE_BACKEND=github GITHUB_TOKEN=... npm run reset:student-passwords
 */
import { hashPassword } from "../src/lib/password";
import { DEFAULT_STUDENT_PASSWORD } from "../src/types/student";
import { listStoragePathnames, readStorageJson, writeStorageJson } from "../src/lib/storage/index";
import type { StudentRecord } from "../src/types/student";
import { clearPortalManifestCache } from "../src/lib/portal-manifest";
import { clearStudentsRegistryCache } from "../src/lib/student-store";

async function main() {
  process.env.STORAGE_BACKEND = process.env.STORAGE_BACKEND || "github";
  const hash = await hashPassword(DEFAULT_STUDENT_PASSWORD);
  const paths = (await listStoragePathnames("portal")).filter((p) => /\/students\.json$/.test(p));

  let updated = 0;
  for (const path of paths) {
    const file = await readStorageJson<{ students?: StudentRecord[] }>(path);
    if (!file?.students?.length) continue;

    const students = file.students.map((s) => ({
      ...s,
      passwordHash: hash,
      updatedAt: new Date().toISOString(),
    }));

    await writeStorageJson(path, { students });
    updated += students.length;
    console.log(`  ✓ ${path} (${students.length} students)`);
  }

  clearPortalManifestCache();
  clearStudentsRegistryCache();
  console.log(`\nReset ${updated} student password(s) to "${DEFAULT_STUDENT_PASSWORD}".`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
