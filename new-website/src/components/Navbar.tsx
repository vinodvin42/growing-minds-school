import Link from "next/link";
import type { SiteSettings } from "@/types/content";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/videos", label: "Videos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({
  settings,
  activePath,
}: {
  settings: SiteSettings;
  activePath: string;
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-pro sticky-top">
      <div className="container">
        <Link className="navbar-brand navbar-brand-pro" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.logoUrl}
            alt={settings.schoolName}
            className="navbar-brand-pro__logo"
          />
        </Link>
        <button
          className="navbar-toggler navbar-toggler-pro"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.href}>
                <Link
                  className={`nav-link nav-link-pro ${activePath === link.href ? "active" : ""}`}
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/admissions" className="btn btn-orange btn-orange-pro ms-lg-3 mt-3 mt-lg-0">
            Apply Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
