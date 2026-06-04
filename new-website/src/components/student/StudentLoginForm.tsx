"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSavedStudentAccount,
  getSavedStudentAccount,
  saveStudentAccount,
  type SavedStudentAccount,
} from "@/lib/student-account-client";
import type { StudentProfile } from "@/types/student";

function profileToSaved(student: StudentProfile): SavedStudentAccount {
  return {
    loginId: student.loginId,
    name: student.name,
    standard: student.standard,
    section: student.section,
  };
}

export default function StudentLoginForm() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [savedAccount, setSavedAccount] = useState<SavedStudentAccount | null>(null);
  const [useSavedAccount, setUseSavedAccount] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const saved = getSavedStudentAccount();
    if (saved) {
      setSavedAccount(saved);
      setLoginId(saved.loginId);
    }

    fetch("/api/student/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.student) {
            saveStudentAccount(profileToSaved(data.student));
            router.replace("/student/dashboard");
          }
        }
      })
      .finally(() => setCheckingSession(false));
  }, [router]);

  function switchAccount() {
    setUseSavedAccount(false);
    setLoginId("");
    setPassword("");
    setError("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ loginId, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Login failed");
        return;
      }
      if (data.student) {
        saveStudentAccount(profileToSaved(data.student));
      }
      router.replace("/student/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-orange" role="status" aria-label="Loading" />
        <p className="text-muted small mt-3 mb-0">Opening student app…</p>
      </div>
    );
  }

  const showSavedCard = savedAccount && useSavedAccount;

  return (
    <div className="container py-4 py-md-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="student-portal-card">
            <div className="text-center mb-4">
              <div className="student-portal-card__badge" aria-hidden="true">
                🎓
              </div>
              <h1 className="h3 fw-bold mb-1">{showSavedCard ? "Welcome back" : "Student Login"}</h1>
              <p className="text-muted mb-0 small">
                {showSavedCard ? "Enter your password to continue" : "Sign in with your student ID and password"}
              </p>
            </div>

            {showSavedCard && (
              <div className="student-saved-account mb-4">
                <div className="student-saved-account__avatar" aria-hidden="true">
                  {savedAccount.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-saved-account__body">
                  <strong>{savedAccount.name}</strong>
                  <span>
                    {savedAccount.loginId}
                    {" · "}
                    {savedAccount.standard}
                    {savedAccount.section ? ` · ${savedAccount.section}` : ""}
                  </span>
                </div>
                <button type="button" className="student-saved-account__switch btn btn-link btn-sm" onClick={switchAccount}>
                  Switch account
                </button>
              </div>
            )}

            <form onSubmit={onSubmit} className="student-login-form">
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}

              {!showSavedCard && (
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
              )}

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
                  autoFocus={!!showSavedCard}
                  required
                />
              </div>

              <button type="submit" className="btn btn-orange btn-lg w-100" disabled={loading}>
                {loading ? "Signing in…" : showSavedCard ? "Continue" : "Sign In"}
              </button>
            </form>

            {showSavedCard && (
              <p className="text-muted small text-center mt-3 mb-0">
                Your login stays saved on this device for 30 days.
              </p>
            )}

            <p className="text-muted small text-center mt-4 mb-0">
              Password trouble? Contact your class teacher or school office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
