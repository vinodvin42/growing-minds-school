import { redirect } from "next/navigation";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import StudentLoginForm from "@/components/student/StudentLoginForm";

export default async function StudentLoginPage() {
  const student = await getCurrentStudentProfile();
  if (student) {
    redirect("/student/dashboard");
  }

  return <StudentLoginForm />;
}
