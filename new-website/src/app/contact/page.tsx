import Link from "next/link";
import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import ContactForm from "@/components/ContactForm";
import ContactInfoCard from "@/components/ContactInfoCard";
import ContactQuickActions from "@/components/ContactQuickActions";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Growing Minds English School in Malad West, Mumbai.",
};

export default async function ContactPage() {
  const { settings } = await getSiteContent();
  const tel = settings.phone.replace(/\s/g, "");

  return (
    <SiteLayout activePath="/contact">
      <PageHero
        title="Contact Us"
        subtitle="We're here to answer your questions and welcome you to our school family"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <ContactQuickActions phone={settings.phone} email={settings.email} address={settings.address} />

      <section className="contact-main-section">
        <div className="container">
          <div className="row g-4 g-xl-5 align-items-stretch">
            <div className="col-lg-5">
              <div className="contact-welcome-panel h-100">
                <SectionHeader
                  eyebrow="Reach Out"
                  title="We'd Love to"
                  highlight="Hear From You"
                  subtitle="Whether you're exploring admissions, scheduling a visit, or have a question about our programs — our team is happy to help."
                  align="left"
                />

                <div className="contact-info-grid">
                  <ContactInfoCard icon="fa-map-marker-alt" title="Our Location" accent="orange" wide>
                    <p>{settings.address}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info-card__link"
                    >
                      Open in Google Maps
                      <i className="fas fa-external-link-alt ms-1" />
                    </a>
                  </ContactInfoCard>

                  <ContactInfoCard icon="fa-phone" title="Phone" accent="lime">
                    <a href={`tel:${tel}`} className="contact-info-card__link contact-info-card__link--dark">
                      {settings.phone}
                    </a>
                    <span className="contact-info-card__hint">Mon–Sat, 9 AM – 5 PM</span>
                  </ContactInfoCard>

                  <ContactInfoCard icon="fa-envelope" title="Email" accent="blue">
                    <a href={`mailto:${settings.email}`} className="contact-info-card__link contact-info-card__link--dark">
                      {settings.email}
                    </a>
                    <span className="contact-info-card__hint">We reply within 24 hours</span>
                  </ContactInfoCard>

                  <ContactInfoCard icon="fa-clock" title="Office Hours" accent="purple" wide>
                    <p style={{ whiteSpace: "pre-line", margin: 0 }}>{settings.officeHours}</p>
                  </ContactInfoCard>
                </div>

                <div className="contact-visit-banner">
                  <div className="contact-visit-banner__icon">
                    <i className="fas fa-school" />
                  </div>
                  <div>
                    <h4 className="contact-visit-banner__title">Plan a School Visit</h4>
                    <p className="contact-visit-banner__text">
                      See our classrooms, meet our teachers, and experience the Growing Minds difference firsthand.
                    </p>
                    <Link href="/admissions" className="btn btn-orange btn-sm">
                      Book a Visit
                      <i className="fas fa-arrow-right ms-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-form-panel h-100">
                <div className="contact-form-panel__header">
                  <div>
                    <span className="contact-form-panel__badge">
                      <i className="fas fa-paper-plane me-1" />
                      Quick Enquiry
                    </span>
                    <h2 className="contact-form-panel__title">Send Us a Message</h2>
                    <p className="contact-form-panel__subtitle">
                      Fill in the form below and we&apos;ll get back to you as soon as possible.
                    </p>
                  </div>
                  <div className="contact-form-panel__decoration" aria-hidden="true">
                    <i className="fas fa-comments" />
                  </div>
                </div>
                <div className="contact-form-panel__body">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-map-section">
        <div className="container">
          <SectionHeader
            eyebrow="Location"
            title="Find Us on the"
            highlight="Map"
            subtitle="Conveniently located in Malad West, Mumbai — easy to reach by road and public transport"
            align="center"
          />
          <div className="contact-map-wrapper">
            <iframe
              src={settings.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Growing Minds English School Location"
            />
            <div className="contact-map-overlay">
              <div className="contact-map-overlay__card">
                <div className="contact-map-overlay__icon">
                  <i className="fas fa-map-pin" />
                </div>
                <div>
                  <strong>Growing Minds English School</strong>
                  <p>Malad West, Mumbai 400095</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-orange btn-sm"
                  >
                    <i className="fas fa-directions me-2" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
