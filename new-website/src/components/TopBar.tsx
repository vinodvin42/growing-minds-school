import Link from "next/link";
import type { SiteSettings } from "@/types/content";

export default function TopBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="top-bar d-none d-lg-block">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-4 top-bar__info">
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`}>
              <i className="fas fa-phone-alt me-2" />
              {settings.phone}
            </a>
            <a href={`mailto:${settings.email}`}>
              <i className="fas fa-envelope me-2" />
              {settings.email}
            </a>
          </div>
          <div className="top-bar__info">
            <i className="fas fa-clock me-2" />
            Mon–Sat: 9:00 AM – 5:00 PM
          </div>
        </div>
      </div>
    </div>
  );
}
