import Link from "next/link";
import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "News & Events",
  description: "Latest news, events, and announcements from Growing Minds English School.",
};

export default async function NewsPage() {
  const content = await getSiteContent();
  const { news, newsAnnouncement, settings } = content;

  return (
    <SiteLayout activePath="/news">
      <PageHero
        title="News & Events"
        subtitle="Latest announcements and updates"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "News" }]}
      />

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 form-card-pro">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <div className="icon-circle-large bg-orange-light text-orange d-inline-flex">
                      <i className="fas fa-bullhorn fa-2x" />
                    </div>
                  </div>
                  <h2 className="h2 fw-bold text-gradient mb-2">{newsAnnouncement.title.replace(/🎉\s*/, "")}</h2>
                  <h3 className="h4 mb-3">{newsAnnouncement.subtitle}</h3>
                  <p className="lead mb-4">{newsAnnouncement.description}</p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <Link href="/admissions" className="btn btn-orange btn-lg">Apply Now</Link>
                    <Link href="/contact" className="btn btn-outline-orange btn-lg">Schedule Visit</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container">
          <div className="row g-4">
            {news.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <article className="card h-100 border-0 shadow hover-lift">
                  <div className={`card-header ${item.headerColor} text-white`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-light text-dark">{item.category}</span>
                      <span><i className="far fa-calendar-alt me-2" />{item.dateLabel}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <i className={`fas ${item.icon} fa-3x text-orange`} />
                    </div>
                    <h3 className="h5 fw-bold mb-3">{item.title}</h3>
                    <p>{item.excerpt}</p>
                    {item.linkUrl && (
                      <Link href={item.linkUrl} className="btn btn-sm btn-orange mt-2">
                        {item.linkText} <i className="fas fa-arrow-right ms-1" />
                      </Link>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-6 fw-bold mb-4">Stay <span className="text-orange">Connected</span></h2>
              <p className="lead mb-4">
                As a newly opened school, we are in the exciting phase of welcoming our first batch of students.
                More events, activities, and celebrations will be announced soon.
              </p>
              <div className="card bg-white p-4 shadow">
                <h4 className="mb-3">For the Latest Updates</h4>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="fas fa-check-circle text-lime me-2" /> Check this page regularly</li>
                  <li className="mb-2"><i className="fas fa-check-circle text-lime me-2" /> Call us at <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-orange">{settings.phone}</a></li>
                  <li className="mb-2"><i className="fas fa-check-circle text-lime me-2" /> Email us at <a href={`mailto:${settings.email}`} className="text-orange">{settings.email}</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 text-white text-center">
        <div className="container">
          <h2 className="display-5 fw-bold mb-3">Ready to Enroll?</h2>
          <p className="lead mb-4">Don&apos;t miss out on the opportunity to be part of our first batch!</p>
          <Link href="/admissions" className="btn btn-orange btn-lg">Apply for Admission</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
