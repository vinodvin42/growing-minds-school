"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSavedStudentAccount,
  saveStudentAccount,
  type SavedStudentAccount,
} from "@/lib/student-account-client";
import type { StudentProfile } from "@/types/student";
import StudentBrand from "@/components/student/StudentBrand";

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
  const errorRef = useRef<HTMLDivElement>(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [error]);

  function switchAccount() {
    setUseSavedAccount(false);
    setLoginId("");
    setPassword("");
    setError("");
    setShowPassword(false);
  }

  function showLoginError(message: string) {
    setError(message);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(120);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedId = loginId.trim();
    const trimmedPass = password.trim();

    try {
      const res = await fetch("/api/student/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ loginId: trimmedId, password: trimmedPass }),
      });

      let data: { success?: boolean; message?: string; student?: StudentProfile };
      try {
        data = await res.json();
      } catch {
        showLoginError("Unable to sign in. Please check your connection and try again.");
        return;
      }

      if (!data.success) {
        showLoginError(data.message || "Invalid student ID or password");
        return;
      }

      if (data.student) {
        saveStudentAccount(profileToSaved(data.student));
      }
      router.replace("/student/dashboard");
      router.refresh();
    } catch {
      showLoginError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="student-login-page student-login-page--loading">
        <div className="spinner-border text-orange" role="status" aria-label="Loading" />
        <p className="student-login-page__loading-text">Opening student app…</p>
      </div>
    );
  }

  const showSavedCard = savedAccount && useSavedAccount;

  return (
    <div className="student-login-page">
      <div className="student-login-page__banner" aria-hidden="true">
        <div className="student-login-page__banner-pattern" />
        <div className="student-login-page__banner-rainbow" />
      </div>
      <div className="student-login-card">
        <div className="student-login-card__head">
          <StudentBrand size="lg" centered showTagline />
          <h1 className="student-login-card__title">{showSavedCard ? "Welcome back" : "Sign in"}</h1>
          <p className="student-login-card__subtitle">
            {showSavedCard ? "Enter your password to continue" : "Use your student ID and password"}
          </p>
        </div>

        {showSavedCard && (
          <div className="student-saved-account">
            <div className="student-saved-account__avatar" aria-hidden="true">
              {savedAccount.name.charAt(0).toUpperCase()}
            </div>
            <div className="student-saved-account__body">
              <strong>{savedAccount.name}</strong>
              <span>
                {savedAccount.loginId}
                {savedAccount.standard ? ` · ${savedAccount.standard}` : ""}
                {savedAccount.section ? ` · ${savedAccount.section}` : ""}
              </span>
            </div>
            <button type="button" className="student-saved-account__switch" onClick={switchAccount}>
              Switch
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="student-login-form">
          {error && (
            <div ref={errorRef} className="student-login-alert" role="alert">
              <i className="fas fa-exclamation-circle" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {!showSavedCard && (
            <div className="student-field">
              <label htmlFor="loginId" className="student-field__label">
                Student ID
              </label>
              <input
                id="loginId"
                className="form-control student-field__input"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                placeholder="e.g. GMS2026001"
                required
              />
            </div>
          )}

          <div className="student-field">
            <label htmlFor="password" className="student-field__label">
              Password
            </label>
            <div className="student-password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control student-field__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus={!!showSavedCard}
                required
              />
              <button
                type="button"
                className="student-password-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-orange btn-lg w-100 student-login-card__submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Signing in…
              </>
            ) : showSavedCard ? (
              "Continue"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {showSavedCard && (
          <p className="student-login-card__footnote">Your account stays saved on this device for 30 days.</p>
        )}

        <p className="student-login-card__help">Password trouble? Ask your teacher or school office.</p>
      </div>
    </div>
  );
}
