import { redirect } from "next/navigation";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import StudentNav from "@/components/student/StudentNav";

export default async function StudentAppLayout({ children }: { children: React.ReactNode }) {
  const student = await getCurrentStudentProfile();
  if (!student) {
    redirect("/student/login");
  }

  return (
    <>
      <StudentNav student={student} />
      {children}
    </>
  );
}
