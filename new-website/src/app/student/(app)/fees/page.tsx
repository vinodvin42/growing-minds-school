import type { Metadata } from "next";
import StudentFeesView from "@/components/student/StudentFeesView";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export const metadata: Metadata = {
  title: "Fees & Account",
};

export default function StudentFeesPage() {
  return (
    <div className="student-page">
      <StudentPageHeader title="Fees & Account" subtitle="Your school fees, payments, and balance" />
      <StudentFeesView />
    </div>
  );
}
