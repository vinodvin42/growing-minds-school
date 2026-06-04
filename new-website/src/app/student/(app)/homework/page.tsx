import type { Metadata } from "next";
import StudentHomeworkList from "@/components/student/StudentHomeworkList";

export const metadata: Metadata = {
  title: "Homework",
};

export default function StudentHomeworkPage() {
  return (
    <div className="container py-4">
      <h1 className="h4 fw-bold mb-3">Homework</h1>
      <StudentHomeworkList />
    </div>
  );
}
