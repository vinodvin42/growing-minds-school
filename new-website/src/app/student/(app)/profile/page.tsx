import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getCurrentStudentProfile } from "@/lib/student-auth";
import StudentPageHeader from "@/components/student/StudentPageHeader";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function StudentProfilePage() {
  const student = await getCurrentStudentProfile();
  if (!student) return null;

  const rows: { label: string; value: ReactNode }[] = [
    { label: "Student ID", value: student.loginId },
    { label: "Full name", value: student.name },
    { label: "Standard", value: student.standard },
  ];
  if (student.section) rows.push({ label: "Section", value: student.section });
  if (student.rollNumber) rows.push({ label: "Roll number", value: student.rollNumber });
  rows.push({ label: "Parent / guardian", value: student.parentName });
  rows.push({
    label: "Parent phone",
    value: <a href={`tel:${student.parentPhone.replace(/\s/g, "")}`}>{student.parentPhone}</a>,
  });
  if (student.parentEmail) {
    rows.push({
      label: "Parent email",
      value: <a href={`mailto:${student.parentEmail}`}>{student.parentEmail}</a>,
    });
  }

  return (
    <div className="student-page">
      <StudentPageHeader title="My Profile" subtitle="Your class and family contact details" />
      <div className="student-profile-grid">
        {rows.map((row) => (
          <div key={row.label} className="student-profile-grid__item">
            <span className="student-profile-grid__label">{row.label}</span>
            <span className="student-profile-grid__value">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
