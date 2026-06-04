import { redirect } from "next/navigation";
import { getCurrentStudentProfile } from "@/lib/student-auth";

/** PWA /student entry — login first, dashboard if session exists. */
export default async function StudentIndexPage() {
  const student = await getCurrentStudentProfile();
  redirect(student ? "/student/dashboard" : "/student/login");
}
