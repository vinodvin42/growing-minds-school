"use client";

import { useRef } from "react";

import { useEffect, useId, useState } from "react";

type AdminListHeaderProps = {
  title: string;
  hint?: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
};

export function AdminListHeader({ title, hint, count, addLabel, onAdd }: AdminListHeaderProps) {
  return (
    <div className="admin-list-header">
      <div>
        <h2 className="admin-section-title mb-1">{title}</h2>
        {hint && <p className="admin-hint mb-0">{hint}</p>}
        <p className="admin-list-header__count">{count} item{count === 1 ? "" : "s"}</p>
      </div>
      <button type="button" className="btn btn-orange btn-sm" onClick={onAdd}>
        <i className="fas fa-plus me-1" />
        {addLabel}
      </button>
    </div>
  );
}

type AdminCollapsibleSectionProps = {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  level?: "section" | "subsection";
  count?: number;
  addLabel?: string;
  onAdd?: () => void;
  children: React.ReactNode;
};

export function AdminCollapsibleSection({
  title,
  hint,
  defaultOpen = true,
  level = "section",
  count,
  addLabel,
  onAdd,
  children,
}: AdminCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={`admin-collapse ${open ? "is-open" : ""} ${level === "subsection" ? "admin-collapse--sub" : ""}`}>
      <div className="admin-collapse__header">
        <button
          type="button"
          className="admin-collapse__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          {level === "section" ? (
            <h2 className="admin-section-title admin-collapse__title">{title}</h2>
          ) : (
            <h3 className="admin-section-subtitle admin-collapse__title">{title}</h3>
          )}
          <i className={`fas fa-chevron-down admin-collapse__chevron${open ? " is-open" : ""}`} aria-hidden="true" />
        </button>
        {(count !== undefined || onAdd) && (
          <div className="admin-collapse__actions">
            {count !== undefined && (
              <span className="admin-collapse__count">{count} item{count === 1 ? "" : "s"}</span>
            )}
            {onAdd && addLabel && (
              <button type="button" className="btn btn-orange btn-sm" onClick={onAdd}>
                <i className="fas fa-plus me-1" />
                {addLabel}
              </button>
            )}
          </div>
        )}
      </div>
      <div id={panelId} className="admin-collapse__body" hidden={!open}>
        {hint && <p className="admin-hint admin-collapse__hint">{hint}</p>}
        {children}
      </div>
    </section>
  );
}

type AdminEditModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
};

export function AdminEditModal({
  open,
  title,
  onClose,
  onDelete,
  children,
  footer,
  size = "lg",
}: AdminEditModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Close dialog" />
      <div className={`admin-modal__dialog admin-modal__dialog--${size}`}>
        <div className="admin-modal__header">
          <h2 id="admin-modal-title" className="admin-modal__title">
            {title}
          </h2>
          <div className="admin-modal__header-actions">
            {onDelete && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={onDelete}>
                <i className="fas fa-trash me-1" />
                Delete
              </button>
            )}
            <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
              <i className="fas fa-times" />
            </button>
          </div>
        </div>
        <div className="admin-modal__body">{children}</div>
        {footer && <div className="admin-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

/** @deprecated Use AdminEditModal — kept for any remaining inline usage */
export function AdminEditorPanel({
  title,
  onBack,
  onDelete,
  children,
}: {
  title: string;
  onBack: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}) {
  return (
    <AdminEditModal open title={title} onClose={onBack} onDelete={onDelete}>
      {children}
    </AdminEditModal>
  );
}

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">{children}</table>
    </div>
  );
}

export function AdminTableThumb({ url, alt = "" }: { url?: string; alt?: string }) {
  if (url) {
    return (
      <td className="admin-table__thumb-cell">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className="admin-table__thumb" />
      </td>
    );
  }
  return (
    <td className="admin-table__thumb-cell">
      <span className="admin-table__thumb admin-table__thumb--empty" aria-hidden="true">
        <i className="fas fa-image" />
      </span>
    </td>
  );
}

export function AdminBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "muted" | "warning";
}) {
  return <span className={`admin-table__badge admin-table__badge--${tone}`}>{children}</span>;
}

export function AdminTableActions({
  onEdit,
  onDelete,
  onReceipt,
  editLabel = "Edit",
  receiptTitle = "Download fee statement",
}: {
  onEdit: () => void;
  onDelete: () => void;
  onReceipt?: () => void;
  editLabel?: string;
  receiptTitle?: string;
}) {
  return (
    <td className="admin-table__actions">
      <button type="button" className="btn btn-sm btn-orange" onClick={onEdit}>
        <i className="fas fa-pen me-1" />
        <span className="admin-table__action-label">{editLabel}</span>
      </button>
      {onReceipt && (
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={onReceipt}
          title={receiptTitle}
          aria-label={receiptTitle}
        >
          <i className="fas fa-file-pdf" aria-hidden="true" />
        </button>
      )}
      <button type="button" className="btn btn-sm btn-outline-danger" onClick={onDelete} aria-label="Delete">
        <i className="fas fa-trash" />
      </button>
    </td>
  );
}

export function AdminCellText({
  primary,
  secondary,
  truncate = true,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  truncate?: boolean;
}) {
  return (
    <td className={`admin-table__text${truncate ? " admin-table__text--truncate" : ""}`}>
      <strong>{primary}</strong>
      {secondary != null && secondary !== "" && <span>{secondary}</span>}
    </td>
  );
}

type AdminFloatingSaveBarProps = {
  label: string;
  saving: boolean;
  disabled?: boolean;
  dirty?: boolean;
  onSave: () => void;
  status?: string;
};

/** Fixed bottom bar — only this should call the server; modal edits stay local until publish. */
export function AdminFloatingSaveBar({ label, saving, disabled, dirty, onSave, status }: AdminFloatingSaveBarProps) {
  const statusText =
    status || (dirty ? "Unsaved changes — publish when ready" : "");

  return (
    <>
      <div className="admin-floating-save-spacer" aria-hidden="true" />
      <div className="admin-floating-save" role="region" aria-label="Save actions">
        <div className="admin-floating-save__inner">
          {statusText ? (
            <span className={`admin-floating-save__status${dirty && !status ? " admin-floating-save__status--dirty" : ""}`}>
              {statusText}
            </span>
          ) : (
            <span className="admin-floating-save__status" aria-hidden="true" />
          )}
          <button
            type="button"
            className={`btn btn-orange admin-floating-save__btn${dirty ? " admin-floating-save__btn--dirty" : ""}`}
            disabled={disabled || saving}
            onClick={onSave}
          >
            {saving ? "Saving…" : label}
          </button>
        </div>
      </div>
    </>
  );
}

type AdminBulkCsvPanelProps = {
  hint: React.ReactNode;
  uploading?: boolean;
  uploadDisabled?: boolean;
  onDownloadTemplate: () => void;
  onExport?: () => void;
  exportDisabled?: boolean;
  onFileSelected: (file: File) => void;
};

/** Reusable CSV bulk import/export panel for admin lists. */
export function AdminBulkCsvPanel({
  hint,
  uploading,
  uploadDisabled,
  onDownloadTemplate,
  onExport,
  exportDisabled,
  onFileSelected,
}: AdminBulkCsvPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="admin-bulk-panel mt-3 p-3 border rounded bg-light">
      <p className="small fw-semibold mb-2 mb-md-1">
        <i className="fas fa-file-csv me-1 text-orange" />
        Bulk upload (CSV)
      </p>
      <p className="small text-muted mb-2">{hint}</p>
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <button type="button" className="btn btn-outline-orange btn-sm" onClick={onDownloadTemplate}>
          <i className="fas fa-download me-1" />
          Sample template
        </button>
        {onExport && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onExport}
            disabled={exportDisabled}
          >
            <i className="fas fa-file-export me-1" />
            Export current list
          </button>
        )}
        <label className="btn btn-orange btn-sm mb-0">
          <i className="fas fa-upload me-1" />
          {uploading ? "Importing…" : "Upload CSV"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="d-none"
            disabled={uploading || uploadDisabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileSelected(file);
                e.target.value = "";
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
