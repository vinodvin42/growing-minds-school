"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentLoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }
      router.replace("/student/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="student-portal-card">
            <div className="text-center mb-4">
              <div className="student-portal-card__badge" aria-hidden="true">
                🎓
              </div>
              <h1 className="h3 fw-bold mb-1">Student Login</h1>
              <p className="text-muted mb-0 small">Sign in with your student ID and password</p>
            </div>

            <form onSubmit={onSubmit} className="student-login-form">
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="loginId" className="form-label fw-semibold">
                  Student ID
                </label>
                <input
                  id="loginId"
                  className="form-control form-control-lg"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  autoComplete="username"
                  placeholder="e.g. GMS2026001"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control form-control-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-orange btn-lg w-100" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <p className="text-muted small text-center mt-4 mb-0">
              Password trouble? Contact your class teacher or school office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
