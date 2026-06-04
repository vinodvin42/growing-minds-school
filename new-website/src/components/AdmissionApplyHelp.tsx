"use client";

import { useEffect, useState } from "react";

const CHECKLIST_ITEMS = [
  "Student details (name, DOB, gender, standard)",
  "Student documents (birth certificate, photo, Aadhaar)",
  "Parent contact details and email",
  "Father & mother Aadhaar and photographs",
  "Current & permanent address with electricity bill",
  "Sibling details (if applicable)",
];

export default function AdmissionApplyHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="admission-help-btn"
        onClick={() => setOpen(true)}
        aria-label="Before you apply — documents checklist"
        title="Before you apply"
      >
        <i className="fas fa-circle-question" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="admission-help-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admission-help-title"
          onClick={() => setOpen(false)}
        >
          <div className="admission-help-modal__dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admission-help-modal__close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <i className="fas fa-times" aria-hidden="true" />
            </button>

            <aside className="admission-checklist admission-checklist--modal">
              <div className="admission-checklist__header">
                <h3 id="admission-help-title">Before you apply</h3>
                <p>Keep these documents ready on your phone or computer</p>
              </div>
              <div className="admission-checklist__body">
                <ul className="admission-checklist__list">
                  {CHECKLIST_ITEMS.map((item) => (
                    <li key={item}>
                      <i className="fas fa-check-circle" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="admission-checklist__tip">
                  <strong>Tip:</strong> Use clear photos or PDF scans. Each file must be under 5 MB. You can expand
                  one section at a time while filling the form.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
