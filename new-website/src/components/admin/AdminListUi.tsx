"use client";

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

type AdminListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  imageUrl?: string;
  badge?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function AdminListRow({ title, subtitle, meta, imageUrl, badge, onEdit, onDelete }: AdminListRowProps) {
  return (
    <div className="admin-list-row">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="admin-list-row__thumb" />
      ) : (
        <div className="admin-list-row__thumb admin-list-row__thumb--empty">
          <i className="fas fa-image" />
        </div>
      )}
      <div className="admin-list-row__body min-w-0">
        {badge && <span className="admin-list-row__badge">{badge}</span>}
        <strong className="admin-list-row__title">{title || "Untitled"}</strong>
        {subtitle && <p className="admin-list-row__subtitle">{subtitle}</p>}
        {meta && <p className="admin-list-row__meta">{meta}</p>}
      </div>
      <div className="admin-list-row__actions">
        <button type="button" className="btn btn-sm btn-orange" onClick={onEdit}>
          <i className="fas fa-pen me-1" />
          Edit
        </button>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onDelete} aria-label="Delete">
          <i className="fas fa-trash" />
        </button>
      </div>
    </div>
  );
}

type AdminEditorPanelProps = {
  title: string;
  onBack: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
};

export function AdminEditorPanel({ title, onBack, onDelete, children }: AdminEditorPanelProps) {
  return (
    <div className="admin-editor-panel">
      <div className="admin-editor-panel__toolbar">
        <button type="button" className="btn btn-sm btn-outline-secondary admin-editor-panel__back" onClick={onBack}>
          <i className="fas fa-arrow-left me-1" />
          Back to list
        </button>
        <h2 className="admin-editor-panel__title">{title}</h2>
        {onDelete && (
          <button type="button" className="btn btn-sm btn-outline-danger ms-auto" onClick={onDelete}>
            <i className="fas fa-trash me-1" />
            Delete
          </button>
        )}
      </div>
      <div className="admin-editor-panel__body">{children}</div>
    </div>
  );
}
