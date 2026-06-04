import type { Metadata } from "next";
import StudentMessagesList from "@/components/student/StudentMessagesList";

export const metadata: Metadata = {
  title: "Messages",
};

export default function StudentMessagesPage() {
  return (
    <div className="container py-4">
      <h1 className="h4 fw-bold mb-3">Teacher Messages</h1>
      <StudentMessagesList />
    </div>
  );
}
