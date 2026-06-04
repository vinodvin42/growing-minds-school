"use client";

import { useId, useState, type ChangeEvent, type ReactNode } from "react";

export function AdmissionCollapsibleSection({
  step,
  title,
  icon,
  hint,
  defaultOpen = false,
  optional,
  children,
}: {
  step: number;
  title: string;
  icon: string;
  hint?: string;
  defaultOpen?: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={`admission-collapse ${open ? "is-open" : ""}`}>
      <div className="admission-collapse__header">
        <button
          type="button"
          className="admission-collapse__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="admission-collapse__step">{step}</span>
          <span className="admission-collapse__icon">
            <i className={`fas ${icon}`} aria-hidden="true" />
          </span>
          <span className="admission-collapse__text">
            <span className="admission-collapse__title">{title}</span>
            {optional && <span className="admission-collapse__badge">Optional</span>}
          </span>
          <i className={`fas fa-chevron-down admission-collapse__chevron${open ? " is-open" : ""}`} aria-hidden="true" />
        </button>
      </div>
      <div id={panelId} className="admission-collapse__body" hidden={!open}>
        {hint && <p className="admission-collapse__hint">{hint}</p>}
        {children}
      </div>
    </section>
  );
}

export function AdmissionField({
  id,
  label,
  icon,
  required,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`admission-field ${className}`.trim()}>
      <label htmlFor={id} className="admission-field__label">
        {label}
        {required && <span className="admission-field__required">*</span>}
      </label>
      <div className="admission-field__input-wrap">
        <span className="admission-field__icon">
          <i className={`fas ${icon}`} aria-hidden="true" />
        </span>
        {children}
      </div>
      {hint && <p className="admission-field__hint">{hint}</p>}
    </div>
  );
}

export function AdmissionFileField({
  name,
  label,
  icon,
  accept,
  required,
  hint,
  onChange,
}: {
  name: string;
  label: string;
  icon: string;
  accept: string;
  required?: boolean;
  hint?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputId = `file-${name}`;
  const [fileName, setFileName] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e);
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  }

  return (
    <div className="admission-file-field">
      <label htmlFor={inputId} className="admission-field__label">
        {label}
        {required && <span className="admission-field__required">*</span>}
      </label>
      <label htmlFor={inputId} className={`admission-file-field__box${fileName ? " has-file" : ""}`}>
        <input
          type="file"
          id={inputId}
          name={name}
          className="admission-file-field__input"
          accept={accept}
          required={required}
          onChange={handleChange}
        />
        <span className="admission-file-field__icon">
          <i className={`fas ${icon}`} aria-hidden="true" />
        </span>
        <span className="admission-file-field__content">
          <span className="admission-file-field__title">
            {fileName ?? "Click to upload"}
          </span>
          <span className="admission-file-field__meta">PDF, JPG or PNG · max 5 MB</span>
        </span>
        <span className="admission-file-field__action">
          <i className="fas fa-folder-open" aria-hidden="true" />
        </span>
      </label>
      {hint && <p className="admission-field__hint">{hint}</p>}
    </div>
  );
}

export const STANDARD_OPTIONS: [string, string][] = [
  ["nursery", "Nursery"],
  ["lkg", "LKG"],
  ["ukg", "UKG"],
  ["1st", "1st Standard"],
  ["2nd", "2nd Standard"],
  ["3rd", "3rd Standard"],
  ["4th", "4th Standard"],
  ["5th", "5th Standard"],
  ["6th", "6th Standard"],
  ["7th", "7th Standard"],
  ["8th", "8th Standard"],
];

export const ADMISSION_INPUT_CLASS = "form-control admission-form-control";
export const ADMISSION_SELECT_CLASS = "form-select admission-form-control";
