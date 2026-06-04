import Link from "next/link";
import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import ContentImage from "@/components/ContentImage";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Growing Minds English School's vision, mission, and values.",
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const { about } = content;

  return (
    <SiteLayout activePath="/about">
      <PageHero
        title={about.heroTitle}
        subtitle={about.heroSubtitle}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <section className="py-5 about-intro-section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <ContentImage
                src={about.introImageUrl}
                alt="Growing Minds School"
                crop={{
                  fit: about.introImageFit,
                  focusX: about.introImageFocusX,
                  focusY: about.introImageFocusY,
                  focus: about.introImageFocus,
                }}
              />
            </div>
            <div className="col-lg-6 about-intro-section__text">
              <SectionHeader
                eyebrow="Who We Are"
                title="Welcome to"
                highlight="Growing Minds"
                subtitle={about.introLead}
                align="left"
              />
              <p>{about.introText}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          <SectionHeader
            eyebrow="Purpose"
            title="Our Vision &"
            highlight="Mission"
            align="center"
          />
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-md" style={{ borderRadius: "var(--radius-lg)", borderTop: "4px solid var(--orange)" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="icon-circle bg-orange text-white me-3">
                      <i className="fas fa-eye fa-2x" />
                    </div>
                    <h3 className="h2 mb-0">Our Vision</h3>
                  </div>
                  <p className="lead">{about.vision}</p>
                  <p>{about.visionExtra}</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-md" style={{ borderRadius: "var(--radius-lg)", borderTop: "4px solid var(--lime)" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="icon-circle bg-lime text-white me-3">
                      <i className="fas fa-bullseye fa-2x" />
                    </div>
                    <h3 className="h2 mb-0">Our Mission</h3>
                  </div>
                  <p className="lead">{about.mission}</p>
                  <p>{about.missionExtra}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <SectionHeader
            eyebrow="Principles"
            title="Our Core"
            highlight="Values"
            subtitle="The principles that guide everything we do"
          />
          <div className="row g-4">
            {about.values.map((v) => (
              <div key={v.title} className="col-md-4">
                <div className="value-card-pro text-center">
                  <div className={`icon-circle-large ${v.colorClass}`}>
                    <i className={`fas ${v.icon} fa-2x`} />
                  </div>
                  <h4 className="fw-bold mb-3">{v.title}</h4>
                  <p>{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5 bg-light about-approach-section">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6 order-lg-2">
              <ContentImage
                src={about.approachImageUrl}
                alt="Students Learning"
                crop={{
                  fit: about.approachImageFit,
                  focusX: about.approachImageFocusX,
                  focusY: about.approachImageFocusY,
                  focus: about.approachImageFocus,
                }}
              />
            </div>
            <div className="col-lg-6 order-lg-1">
              <h2 className="display-6 fw-bold mb-4">Our <span className="text-lime">Child-Centric</span> Approach</h2>
              <p className="lead">{about.approachLead}</p>
              <ul className="list-unstyled">
                {about.approachPoints.map((point, i) => (
                  <li key={point.title} className="mb-3">
                    <i className={`fas fa-check-circle ${i % 2 === 0 ? "text-orange" : "text-lime"} me-2`} />
                    <strong>{point.title}:</strong> {point.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section py-5 text-white text-center">
        <div className="container">
          <h2 className="display-5 fw-bold mb-3">Join Our Growing Family!</h2>
          <p className="lead mb-4">Experience the Growing Minds difference for your child</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link href="/admissions" className="btn btn-orange btn-lg">Apply for Admission</Link>
            <Link href="/contact" className="btn btn-outline-light btn-lg">Contact Us</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
