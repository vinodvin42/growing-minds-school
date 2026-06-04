"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStudentNotifications } from "@/components/student/StudentNotificationProvider";

const TABS = [
  { href: "/student/dashboard", label: "Home", icon: "fa-home", countKey: "total" as const },
  { href: "/student/calendar", label: "Calendar", icon: "fa-calendar-alt", countKey: "calendar" as const },
  { href: "/student/homework", label: "Work", icon: "fa-book", countKey: "homework" as const },
  { href: "/student/messages", label: "Alerts", icon: "fa-bullhorn", countKey: "messages" as const },
  { href: "/student/fees", label: "Fees", icon: "fa-wallet", countKey: "fees" as const },
  { href: "/student/profile", label: "Profile", icon: "fa-user", countKey: null },
] as const;

export default function StudentBottomNav() {
  const pathname = usePathname();
  const { counts } = useStudentNotifications();

  return (
    <nav className="student-bottom-nav" aria-label="Student app navigation">
      <div className="student-bottom-nav__rainbow" aria-hidden="true" />
      <div className="student-bottom-nav__inner">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          const badge = tab.countKey ? counts[tab.countKey] : 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`student-bottom-nav__item${active ? " student-bottom-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="student-bottom-nav__icon-wrap">
                <i className={`fas ${tab.icon}`} aria-hidden="true" />
                {badge > 0 && (
                  <span className="student-bottom-nav__badge" aria-label={`${badge} new`}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
