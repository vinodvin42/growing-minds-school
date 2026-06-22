"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { AdminPublishLog } from "@/lib/admin-publish-log";

type ToastTone = "success" | "error";

type AdminToastItem = AdminPublishLog & {
  id: string;
  tone: ToastTone;
};

type AdminToastContextValue = {
  showPublishLog: (log: AdminPublishLog, tone?: ToastTone) => void;
  showError: (title: string, lines?: string[]) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

const TOAST_MS = 12_000;

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (item: Omit<AdminToastItem, "id">) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { ...item, id }]);
      window.setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss]
  );

  const showPublishLog = useCallback(
    (log: AdminPublishLog, tone: ToastTone = "success") => {
      push({ tone, title: log.title, lines: log.lines });
    },
    [push]
  );

  const showError = useCallback(
    (title: string, lines: string[] = []) => {
      push({ tone: "error", title, lines: lines.length ? lines : ["Please try again."] });
    },
    [push]
  );

  return (
    <AdminToastContext.Provider value={{ showPublishLog, showError }}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast admin-toast--${toast.tone}`} role="status">
            <div className="admin-toast__header">
              <i
                className={`fas fa-${toast.tone === "success" ? "check-circle" : "exclamation-circle"} admin-toast__icon`}
                aria-hidden="true"
              />
              <strong className="admin-toast__title">{toast.title}</strong>
              <button type="button" className="admin-toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss">
                ×
              </button>
            </div>
            <ul className="admin-toast__lines">
              {toast.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
}
