import type { Metadata } from "next";
import StudentCalendarView from "@/components/student/StudentCalendarView";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function StudentCalendarPage() {
  return (
    <div className="student-page">
      <StudentPageHeader
        title="School Calendar"
        subtitle="Holidays, PTM dates, and important reminders"
      />
      <StudentCalendarView />
    </div>
  );
}
