"use client";

import type { ReactNode } from "react";

type FeeCollapsibleProps = {
  id: string;
  label: string;
  hint: string;
  totalLabel: string;
  open: boolean;
  onToggle: () => void;
  footer?: ReactNode;
  children: ReactNode;
  variant?: "default" | "paid";
};

export default function FeeCollapsible({
  id,
  label,
  hint,
  totalLabel,
  open,
  onToggle,
  footer,
  children,
  variant = "default",
}: FeeCollapsibleProps) {
  return (
    <div className={`student-fee-collapsible${open ? " student-fee-collapsible--open" : ""}${variant === "paid" ? " student-fee-collapsible--paid" : ""}`}>
      <button
        type="button"
        className="student-fee-collapsible__trigger"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="student-fee-collapsible__trigger-main">
          <span className="student-fee-collapsible__label">{label}</span>
          <span className="student-fee-collapsible__hint">{hint}</span>
        </span>
        <span className="student-fee-collapsible__total">{totalLabel}</span>
        <i
          className={`fas fa-chevron-down student-fee-collapsible__chevron${open ? " student-fee-collapsible__chevron--open" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div id={id} className="student-fee-collapsible__panel" hidden={!open}>
        {children}
        {footer}
      </div>
    </div>
  );
}
