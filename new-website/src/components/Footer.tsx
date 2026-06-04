import Link from "next/link";
import type { SiteSettings } from "@/types/content";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/admissions", label: "Admissions" },
  { href: "/news", label: "News & Events" },
  { href: "/gallery", label: "Photo Gallery" },
  { href: "/activities", label: "Student Activities" },
  { href: "/videos", label: "Video Library" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="footer-pro mt-auto">
      <div className="footer-pro__main">
        <div className="container">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-4">
              <div className="footer-pro__brand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.logoUrl} alt={settings.schoolName} className="footer-pro__logo" />
              </div>
              <p className="footer-pro__desc">{settings.footerDescription}</p>
            </div>
            <div className="col-6 col-lg-2">
              <h6 className="footer-pro__heading">Quick Links</h6>
              <ul className="footer-pro__links">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-6 col-lg-3">
              <h6 className="footer-pro__heading">Programs</h6>
              <ul className="footer-pro__links">
                <li>Nursery & Preschool</li>
                <li>LKG & UKG</li>
                <li>Primary (1st–5th)</li>
                <li>Upper Primary (6th–8th)</li>
              </ul>
            </div>
            <div className="col-lg-3">
              <h6 className="footer-pro__heading">Contact</h6>
              <ul className="footer-pro__contact">
                <li>
                  <i className="fas fa-map-marker-alt" />
                  <span>{settings.address}</span>
                </li>
                <li>
                  <i className="fas fa-phone-alt" />
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>
                </li>
                <li>
                  <i className="fas fa-envelope" />
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
                <li>
                  <i className="fas fa-clock" />
                  <span>Mon–Sat: 9 AM – 5 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-pro__bottom">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <p className="mb-0">&copy; 2026 {settings.schoolName}. All rights reserved.</p>
            <p className="mb-0 footer-pro__tag">Nurturing Young Minds in Malad West, Mumbai</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
