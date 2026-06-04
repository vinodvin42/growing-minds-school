"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.message || "Invalid password");
    }
    setLoading(false);
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-card__header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/logo-full.jpg" alt="Growing Minds" className="admin-login-card__logo" />
          <h1>Content Manager</h1>
          <p>Growing Minds English School</p>
        </div>
        <div className="admin-login-card__body">
          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              <i className="fas fa-exclamation-circle me-2" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Admin Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-orange w-100 py-2" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2" />
                  Sign In
                </>
              )}
            </button>
          </form>
          <p className="admin-login-card__hint">
            Dev default: admin123 — set ADMIN_PASSWORD in production
          </p>
          <div className="text-center">
            <a href="/" className="admin-login-back">
              <i className="fas fa-arrow-left" />
              Back to website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
