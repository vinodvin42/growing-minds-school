import type { AdminTab } from "@/components/admin/admin-nav";
import { ADMIN_NAV_SECTIONS } from "@/components/admin/admin-nav";

export default function AdminDashboard({ onSelect }: { onSelect: (tab: AdminTab) => void }) {
  return (
    <div className="admin-dashboard">
      <p className="admin-dashboard__lead">
        Manage your public website and the student mobile app from one place. Pick a section below or use the sidebar.
      </p>

      <div className="admin-dashboard__sections">
        {ADMIN_NAV_SECTIONS.filter((s) => s.id !== "overview").map((section) => (
          <section key={section.id} className="admin-dashboard__group">
            <h2 className="admin-dashboard__group-title">{section.label}</h2>
            <div className="admin-dashboard__grid">
              {section.items.map((item) => (
                <button key={item.id} type="button" className="admin-dashboard__card" onClick={() => onSelect(item.id)}>
                  <span className="admin-dashboard__card-icon">
                    <i className={`fas ${item.icon}`} aria-hidden="true" />
                  </span>
                  <span className="admin-dashboard__card-body">
                    <strong>{item.label}</strong>
                    {item.hint && <span>{item.hint}</span>}
                  </span>
                  <i className="fas fa-chevron-right admin-dashboard__card-arrow" aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
