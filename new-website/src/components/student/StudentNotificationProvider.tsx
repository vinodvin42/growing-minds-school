"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  countNotificationsBySection,
  sectionForNotificationKind,
  type StudentNotification,
  type StudentNotificationCounts,
  type StudentNotificationSection,
} from "@/types/student-notifications";
import {
  getStudentLastSeen,
  isNotificationUnseen,
  markStudentSectionSeen,
} from "@/lib/student-seen-client";

const POLL_MS = 120_000;

type StudentNotificationContextValue = {
  unseen: StudentNotification[];
  counts: StudentNotificationCounts;
  loading: boolean;
  refresh: () => void;
  markSeen: (section: StudentNotificationSection) => void;
  dismissBanner: () => void;
  bannerDismissed: boolean;
};

const StudentNotificationContext = createContext<StudentNotificationContextValue | null>(null);

export function StudentNotificationProvider({
  studentId,
  children,
}: {
  studentId: string;
  children: ReactNode;
}) {
  const [allItems, setAllItems] = useState<StudentNotification[]>([]);
  const [lastSeen, setLastSeen] = useState(() => getStudentLastSeen(studentId));
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/student/notifications", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setAllItems(data.items ?? []);
      }
    } catch {
      /* keep previous */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLastSeen(getStudentLastSeen(studentId));
    refresh();
  }, [studentId, refresh]);

  useEffect(() => {
    const interval = setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const unseen = useMemo(() => {
    void tick;
    const seen = getStudentLastSeen(studentId);
    return allItems.filter((item) => isNotificationUnseen(item.timestamp, item.kind, seen));
  }, [allItems, studentId, lastSeen, tick]);

  const counts = useMemo(() => countNotificationsBySection(unseen), [unseen]);

  useEffect(() => {
    if (counts.total > 0) setBannerDismissed(false);
  }, [counts.total]);

  const markSeen = useCallback(
    (section: StudentNotificationSection) => {
      markStudentSectionSeen(studentId, section);
      setLastSeen(getStudentLastSeen(studentId));
      setTick((t) => t + 1);
      setBannerDismissed(false);
    },
    [studentId]
  );

  const dismissBanner = useCallback(() => setBannerDismissed(true), []);

  const value = useMemo(
    () => ({
      unseen,
      counts,
      loading,
      refresh,
      markSeen,
      dismissBanner,
      bannerDismissed,
    }),
    [unseen, counts, loading, refresh, markSeen, dismissBanner, bannerDismissed]
  );

  return (
    <StudentNotificationContext.Provider value={value}>{children}</StudentNotificationContext.Provider>
  );
}

export function useStudentNotifications(): StudentNotificationContextValue {
  const ctx = useContext(StudentNotificationContext);
  if (!ctx) {
    throw new Error("useStudentNotifications must be used within StudentNotificationProvider");
  }
  return ctx;
}

/** Mark a section seen when the student opens that page */
export function useMarkSectionSeen(section: StudentNotificationSection): void {
  const { markSeen } = useStudentNotifications();
  useEffect(() => {
    markSeen(section);
  }, [section, markSeen]);
}

export function useUnseenCountForPath(pathname: string | null): number {
  const { counts } = useStudentNotifications();
  if (!pathname) return 0;
  if (pathname.startsWith("/student/homework")) return counts.homework;
  if (pathname.startsWith("/student/messages")) return counts.messages;
  if (pathname.startsWith("/student/fees")) return counts.fees;
  if (pathname.startsWith("/student/calendar")) return counts.calendar;
  if (pathname.startsWith("/student/dashboard")) return counts.total;
  return 0;
}

export function sectionForPath(pathname: string): StudentNotificationSection | null {
  if (pathname.startsWith("/student/homework")) return "homework";
  if (pathname.startsWith("/student/messages")) return "messages";
  if (pathname.startsWith("/student/fees")) return "fees";
  if (pathname.startsWith("/student/calendar")) return "calendar";
  return null;
}

export { sectionForNotificationKind };
