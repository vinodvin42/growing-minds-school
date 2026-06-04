import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Login",
  description: "Sign in to the Growing Minds student and parent portal.",
};

export default function StudentLoginPage() {
  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="student-portal-card text-center">
            <div className="student-portal-card__badge" aria-hidden="true">
              🎓
            </div>
            <h1 className="h3 fw-bold mb-2">Student Login</h1>
            <p className="text-muted mb-4">
              Welcome to the Growing Minds app. Student sign-in and class pages will appear here when your school
              enables accounts.
            </p>

            <div className="student-portal-card__tips text-start mb-4">
              <p className="fw-semibold mb-2">Coming soon</p>
              <ul className="small text-muted mb-0">
                <li>Homework & announcements</li>
                <li>Attendance & report cards</li>
                <li>Messages from teachers</li>
              </ul>
            </div>

            <div className="d-grid gap-2">
              <Link href="/install-app" className="btn btn-outline-secondary">
                App install help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
