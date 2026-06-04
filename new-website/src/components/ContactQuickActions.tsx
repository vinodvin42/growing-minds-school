import Link from "next/link";

type ContactQuickActionsProps = {
  phone: string;
  email: string;
  address: string;
};

export default function ContactQuickActions({ phone, email, address }: ContactQuickActionsProps) {
  const tel = phone.replace(/\s/g, "");
  const mapsQuery = encodeURIComponent(address);

  return (
    <section className="contact-quick-actions">
      <div className="container">
        <div className="contact-quick-actions__grid">
          <a href={`tel:${tel}`} className="contact-quick-action contact-quick-action--orange">
            <span className="contact-quick-action__icon">
              <i className="fas fa-phone-alt" />
            </span>
            <span className="contact-quick-action__text">
              <strong>Call Us</strong>
              <span>{phone}</span>
            </span>
          </a>
          <a href={`mailto:${email}`} className="contact-quick-action contact-quick-action--lime">
            <span className="contact-quick-action__icon">
              <i className="fas fa-envelope" />
            </span>
            <span className="contact-quick-action__text">
              <strong>Email Us</strong>
              <span>{email}</span>
            </span>
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-quick-action contact-quick-action--blue"
          >
            <span className="contact-quick-action__icon">
              <i className="fas fa-directions" />
            </span>
            <span className="contact-quick-action__text">
              <strong>Get Directions</strong>
              <span>Malad West, Mumbai</span>
            </span>
          </a>
          <Link href="/admissions" className="contact-quick-action contact-quick-action--purple">
            <span className="contact-quick-action__icon">
              <i className="fas fa-graduation-cap" />
            </span>
            <span className="contact-quick-action__text">
              <strong>Apply Now</strong>
              <span>Admissions 2026–2027</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
