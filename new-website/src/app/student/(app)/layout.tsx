import { redirect } from "next/navigation";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import StudentAppShell from "@/components/student/StudentAppShell";

export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const student = await getCurrentStudentProfile();
  if (!student) {
    redirect("/student/login");
  }

  return <StudentAppShell student={student}>{children}</StudentAppShell>;
}
