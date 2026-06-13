/**
 * Seed demo student + portal manifest into storage (GitHub on Vercel, ./data locally).
 * Run: STORAGE_BACKEND=github GITHUB_TOKEN=... npm run seed:portal
 */
import { hashPassword } from "../src/lib/password";
import { saveStudentsRegistry } from "../src/lib/student-store";
import {
  DEFAULT_STUDENT_LOGIN_ID,
  DEFAULT_STUDENT_PASSWORD,
  type StudentsRegistry,
} from "../src/types/student";

async function main() {
  const now = new Date().toISOString();
  const registry: StudentsRegistry = {
    students: [
      {
        id: "demo-student-1",
        loginId: DEFAULT_STUDENT_LOGIN_ID,
        passwordHash: await hashPassword(DEFAULT_STUDENT_PASSWORD),
        name: "Demo Student",
        standard: "3rd Standard",
        section: "A",
        rollNumber: "12",
        parentName: "Demo Parent",
        parentPhone: "+91 98765 43210",
        parentEmail: "",
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };

  await saveStudentsRegistry(registry);
  console.log("Portal seeded:", registry.students.length, "student(s)");
  console.log("Login:", DEFAULT_STUDENT_LOGIN_ID, "/", DEFAULT_STUDENT_PASSWORD);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
