"use client";

import { useEffect, useState } from "react";
import { useMarkSectionSeen } from "@/components/student/StudentNotificationProvider";
import {
  FEE_CATEGORIES,
  FEE_PAYMENT_MODES,
  formatInr,
  feeStatusLabel,
  type StudentFeeSummary,
} from "@/types/student-fees";

function categoryLabel(value: string): string {
  return FEE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function modeLabel(value: string): string {
  return FEE_PAYMENT_MODES.find((m) => m.value === value)?.label ?? value;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function StudentFeesView() {
  useMarkSectionSeen("fees");
  const [account, setAccount] = useState<StudentFeeSummary | null>(null);
  const [academicYear, setAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/student/fees", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAccount(data.account ?? null);
          setAcademicYear(data.academicYear ?? "");
        } else {
          setError(data.message || "Could not load fee account");
        }
      })
      .catch(() => setError("Could not load fee account"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-orange" role="status" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!account) {
    return (
      <div className="portal-empty text-center py-5">
        <span className="portal-empty__icon" aria-hidden="true">
          💳
        </span>
        <p className="text-muted mb-0">Fee account not available yet.</p>
      </div>
    );
  }

  const statusClass =
    account.status === "paid"
      ? "student-fee-status--paid"
      : account.status === "overdue"
        ? "student-fee-status--overdue"
        : account.status === "partial"
          ? "student-fee-status--partial"
          : "student-fee-status--pending";

  return (
    <div className="student-fees">
      <div className="student-fee-summary-grid">
        <div className="student-fee-summary-card">
          <span className="student-fee-summary-card__label">Total fees</span>
          <strong className="student-fee-summary-card__value">{formatInr(account.totalDue)}</strong>
          <span className="student-fee-summary-card__hint">AY {academicYear}</span>
        </div>
        <div className="student-fee-summary-card student-fee-summary-card--paid">
          <span className="student-fee-summary-card__label">Paid</span>
          <strong className="student-fee-summary-card__value">{formatInr(account.totalPaid)}</strong>
        </div>
        <div className="student-fee-summary-card student-fee-summary-card--balance">
          <span className="student-fee-summary-card__label">Balance</span>
          <strong className="student-fee-summary-card__value">{formatInr(account.balance)}</strong>
          <span className={`student-fee-status ${statusClass}`}>{feeStatusLabel(account.status)}</span>
        </div>
      </div>

      {account.notes?.trim() && (
        <div className="student-tip-card mb-3">
          <i className="fas fa-info-circle student-tip-card__icon" aria-hidden="true" />
          <p className="mb-0">{account.notes}</p>
        </div>
      )}

      <section className="student-fees-section">
        {account.lineItems.length === 0 ? (
          <>
            <h2 className="student-fees-section__title">Fee breakdown</h2>
            <p className="text-muted small mb-0">No fee items posted yet.</p>
          </>
        ) : (
          <div className={`student-fee-collapsible${breakdownOpen ? " student-fee-collapsible--open" : ""}`}>
            <button
              type="button"
              className="student-fee-collapsible__trigger"
              onClick={() => setBreakdownOpen((o) => !o)}
              aria-expanded={breakdownOpen}
              aria-controls="student-fee-breakdown"
            >
              <span className="student-fee-collapsible__trigger-main">
                <span className="student-fee-collapsible__label">Fee breakdown</span>
                <span className="student-fee-collapsible__hint">
                  {account.lineItems.length} item{account.lineItems.length === 1 ? "" : "s"} · Tap to{" "}
                  {breakdownOpen ? "hide" : "view"} details
                </span>
              </span>
              <span className="student-fee-collapsible__total">{formatInr(account.totalDue)}</span>
              <i
                className={`fas fa-chevron-down student-fee-collapsible__chevron${breakdownOpen ? " student-fee-collapsible__chevron--open" : ""}`}
                aria-hidden="true"
              />
            </button>
            <div id="student-fee-breakdown" className="student-fee-collapsible__panel" hidden={!breakdownOpen}>
              <ul className="student-fee-list student-fee-list--nested">
                {account.lineItems.map((item) => (
                  <li key={item.id} className="student-fee-list__item">
                    <div className="student-fee-list__main">
                      <strong>{item.label || categoryLabel(item.category)}</strong>
                      <span className="student-fee-list__category">{categoryLabel(item.category)}</span>
                    </div>
                    <div className="student-fee-list__meta">
                      <span className="student-fee-list__amount">{formatInr(item.amount)}</span>
                      {item.dueDate && <span className="student-fee-list__due">Due {formatDate(item.dueDate)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="student-fee-collapsible__footer">
                <span>Total</span>
                <strong>{formatInr(account.totalDue)}</strong>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="student-fees-section">
        <h2 className="student-fees-section__title">Payment history</h2>
        {account.payments.length === 0 ? (
          <p className="text-muted small mb-0">No payments recorded yet.</p>
        ) : (
          <ul className="student-fee-list student-fee-list--payments">
            {[...account.payments]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((payment) => (
                <li key={payment.id} className="student-fee-list__item">
                  <div className="student-fee-list__main">
                    <strong>{formatInr(payment.amount)}</strong>
                    <span className="student-fee-list__category">{modeLabel(payment.mode)}</span>
                  </div>
                  <div className="student-fee-list__meta">
                    <span>{formatDate(payment.date)}</span>
                    {payment.reference && <span className="student-fee-list__ref">Ref: {payment.reference}</span>}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      <p className="student-fees-footnote">
        Questions about fees? Contact the school office or your class teacher.
      </p>
    </div>
  );
}
