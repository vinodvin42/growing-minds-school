import type { Metadata } from "next";
import StudentHomeworkList from "@/components/student/StudentHomeworkList";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export const metadata: Metadata = {
  title: "Homework",
};

export default function StudentHomeworkPage() {
  return (
    <div className="student-page">
      <StudentPageHeader title="Homework" subtitle="Assignments and worksheets from your teachers" />
      <StudentHomeworkList />
    </div>
  );
}
