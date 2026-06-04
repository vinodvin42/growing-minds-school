"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminTab } from "@/components/admin/admin-nav";
import { ADMIN_NAV_SECTIONS, findAdminNavItem, findAdminSection } from "@/components/admin/admin-nav";

type AdminTopNavProps = {
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
};

export default function AdminTopNav({ activeTab, onSelect }: AdminTopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const activeSection = findAdminSection(activeTab);
  const activeItem = findAdminNavItem(activeTab);

  const closeAll = useCallback(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, []);

  const select = useCallback(
    (id: AdminTab) => {
      onSelect(id);
      closeAll();
    },
    [onSelect, closeAll],
  );

  useEffect(() => {
    if (!openDropdown && !mobileOpen) return;

    function onPointerDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        closeAll();
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openDropdown, mobileOpen, closeAll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleDropdown(sectionId: string) {
    setOpenDropdown((current) => (current === sectionId ? null : sectionId));
  }

  return (
    <nav ref={navRef} className="admin-menu" aria-label="Admin sections">
      <div className="admin-menu__bar">
        {/* Desktop + tablet menu */}
        <div className="admin-menu__desktop">
          {ADMIN_NAV_SECTIONS.map((section) => {
            const isSectionActive = activeSection?.id === section.id;
            const isSingle = section.items.length === 1;

            if (isSingle) {
              const item = section.items[0];
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`admin-menu__tab ${activeTab === item.id ? "is-active" : ""}`}
                  onClick={() => select(item.id)}
                >
                  <i className={`fas ${item.icon}`} aria-hidden="true" />
                  {item.label}
                </button>
              );
            }

            const open = openDropdown === section.id;

            return (
              <div key={section.id} className={`admin-menu__dropdown ${open ? "is-open" : ""}`}>
                <button
                  type="button"
                  className={`admin-menu__trigger ${isSectionActive ? "is-active" : ""}`}
                  onClick={() => toggleDropdown(section.id)}
                  aria-expanded={open}
                  aria-haspopup="true"
                >
                  <span>{section.label}</span>
                  <i className={`fas fa-chevron-down admin-menu__chevron${open ? " is-open" : ""}`} aria-hidden="true" />
                </button>

                {open && (
                  <div className="admin-menu__panel" role="menu">
                    <p className="admin-menu__panel-title">{section.label}</p>
                    <ul className="admin-menu__list">
                      {section.items.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            role="menuitem"
                            className={`admin-menu__item ${activeTab === item.id ? "is-active" : ""}`}
                            onClick={() => select(item.id)}
                          >
                            <span className="admin-menu__item-icon">
                              <i className={`fas ${item.icon}`} aria-hidden="true" />
                            </span>
                            <span className="admin-menu__item-body">
                              <strong>{item.label}</strong>
                              {item.hint && <span>{item.hint}</span>}
                            </span>
                            {activeTab === item.id && (
                              <i className="fas fa-check admin-menu__item-check" aria-hidden="true" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="admin-menu__mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-menu"
        >
          <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"}`} aria-hidden="true" />
          <span>{mobileOpen ? "Close" : activeItem?.label ?? "Menu"}</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <button type="button" className="admin-menu__backdrop" onClick={closeAll} aria-label="Close menu" />
          <div id="admin-mobile-menu" className="admin-menu__drawer">
            {ADMIN_NAV_SECTIONS.map((section) => (
              <div key={section.id} className="admin-menu__drawer-group">
                <p className="admin-menu__drawer-label">{section.label}</p>
                <ul className="admin-menu__drawer-list">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={`admin-menu__drawer-item ${activeTab === item.id ? "is-active" : ""}`}
                        onClick={() => select(item.id)}
                      >
                        <i className={`fas ${item.icon}`} aria-hidden="true" />
                        <span>
                          <strong>{item.label}</strong>
                          {item.hint && <small>{item.hint}</small>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
