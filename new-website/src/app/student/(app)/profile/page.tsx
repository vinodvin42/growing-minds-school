import type { Metadata } from "next";
import { getCurrentStudentProfile } from "@/lib/student-auth";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function StudentProfilePage() {
  const student = await getCurrentStudentProfile();
  if (!student) return null;

  return (
    <div className="container py-4">
      <div className="student-profile-card">
        <h1 className="h4 fw-bold mb-3">My Profile</h1>
        <dl className="student-profile-list">
          <div>
            <dt>Student ID</dt>
            <dd>{student.loginId}</dd>
          </div>
          <div>
            <dt>Name</dt>
            <dd>{student.name}</dd>
          </div>
          <div>
            <dt>Standard</dt>
            <dd>{student.standard}</dd>
          </div>
          {student.section && (
            <div>
              <dt>Section</dt>
              <dd>{student.section}</dd>
            </div>
          )}
          {student.rollNumber && (
            <div>
              <dt>Roll Number</dt>
              <dd>{student.rollNumber}</dd>
            </div>
          )}
          <div>
            <dt>Parent / Guardian</dt>
            <dd>{student.parentName}</dd>
          </div>
          <div>
            <dt>Parent Phone</dt>
            <dd>
              <a href={`tel:${student.parentPhone.replace(/\s/g, "")}`}>{student.parentPhone}</a>
            </dd>
          </div>
          {student.parentEmail && (
            <div>
              <dt>Parent Email</dt>
              <dd>
                <a href={`mailto:${student.parentEmail}`}>{student.parentEmail}</a>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
