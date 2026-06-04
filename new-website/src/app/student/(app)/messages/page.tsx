import type { Metadata } from "next";
import StudentMessagesList from "@/components/student/StudentMessagesList";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export const metadata: Metadata = {
  title: "Messages",
};

export default function StudentMessagesPage() {
  return (
    <div className="student-page">
      <StudentPageHeader title="Messages" subtitle="Broadcasts and personal notes from teachers" />
      <StudentMessagesList />
    </div>
  );
}
