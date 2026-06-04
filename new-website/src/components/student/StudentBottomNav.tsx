"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/student/dashboard", label: "Home", icon: "fa-home" },
  { href: "/student/homework", label: "Homework", icon: "fa-book" },
  { href: "/student/messages", label: "Messages", icon: "fa-bullhorn" },
  { href: "/student/profile", label: "Profile", icon: "fa-user" },
] as const;

export default function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="student-bottom-nav" aria-label="Student app navigation">
      <div className="student-bottom-nav__inner">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`student-bottom-nav__item${active ? " student-bottom-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <i className={`fas ${tab.icon}`} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
