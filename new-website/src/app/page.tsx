import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import HeroCarousel from "@/components/HeroCarousel";
import VideoPlayButton from "@/components/VideoPlayButton";
import SectionHeader from "@/components/SectionHeader";
import StatsBar from "@/components/StatsBar";
import JsonLd from "@/components/JsonLd";
import { getSiteContent } from "@/lib/content";
import { filterLogoFromGallery, filterLogoFromSlides } from "@/lib/media";
import { getSchoolJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const content = await getSiteContent();
  const { settings, homepage, carousel, programs, enrollmentSteps, teachers, testimonials, gallery, videos } = content;
  const bannerSlides = filterLogoFromSlides(carousel);
  const galleryPhotos = filterLogoFromGallery(gallery);

  return (
    <SiteLayout activePath="/">
      <JsonLd data={getSchoolJsonLd(settings)} />
      <HeroCarousel slides={bannerSlides} />
      <StatsBar />

      <section className="hero-section">
        <div className="container position-relative">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6 text-center text-lg-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.logoUrl}
                alt={settings.schoolName}
                className="hero-logo-full mb-3 mb-lg-4"
              />
              <span className="hero-intro-badge">
                <i className="fas fa-award" />
                {homepage.badge.replace(/🎓\s*/, "")}
              </span>
              <p className="hero-description fs-5 text-muted mb-0">
                {homepage.heroDescription}
              </p>
            </div>

            <div className="col-lg-6">
              <div className="hero-section__cta text-center">
                <div className="admission-banner mx-auto mx-lg-0 mb-3">
                  <h2 className="fw-bold mb-2">{homepage.admissionTitle.replace(/🎉\s*/, "")}</h2>
                  <p className="fs-5 mb-1 opacity-75">{homepage.admissionYear}</p>
                  <p className="fs-6 mb-4 opacity-75">{homepage.admissionGrades}</p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <Link href="/admissions" className="btn btn-orange btn-lg">Apply Online</Link>
                    <Link href="/contact" className="btn btn-outline-light btn-lg">Schedule a Visit</Link>
                  </div>
                </div>
                <VideoPlayButton videos={videos} buttonText={homepage.featuredVideoButtonText} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="programs-section">
        <div className="container">
          <SectionHeader
            eyebrow="Academics"
            title="Our"
            highlight="Programs"
            subtitle="Age-appropriate learning experiences designed for every stage of your child's development"
          />
          <div className="row g-4">
            {programs.map((p) => (
              <div key={p.id} className={p.id === "4" || p.id === "5" ? "col-md-6" : "col-md-4"}>
                <div className="program-card">
                  <div className="program-icon">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p className="text-orange fw-bold">{p.ageRange}</p>
                  <p>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="enrollment-section">
        <div className="container">
          <SectionHeader
            eyebrow="Admissions"
            title="Simple"
            highlight="Enrollment Process"
            subtitle="Join our school family in four straightforward steps"
            light
          />
          <div className="row g-4">
            {enrollmentSteps.map((step) => (
              <div key={step.number} className="col-md-6 col-lg-3">
                <div className="enrollment-step">
                  <div className={`step-number ${step.colorClass}`}>{step.number}</div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="teachers-section">
        <div className="container">
          <SectionHeader
            eyebrow="Our Team"
            title="Meet Our"
            highlight="Expert Educators"
            subtitle="Experienced, passionate teachers dedicated to nurturing every child's potential"
          />
          <div className="row g-4">
            {teachers.map((t) => (
              <div key={t.id} className="col-md-6 col-lg-3">
                <div className="teacher-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.photoUrl} alt={t.name} />
                  <div className="teacher-info">
                    <h5>{t.name}</h5>
                    <p className="text-orange">{t.role}</p>
                    <p className="small">{t.experience}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section bg-light">
        <div className="container">
          <SectionHeader
            eyebrow="Testimonials"
            title="What"
            highlight="Parents Say"
            subtitle="Trusted by families across Malad West for quality education and care"
          />
          <div className="row g-4">
            {testimonials.map((t) => (
              <div key={t.id} className="col-md-4">
                <div className="testimonial-card">
                  <div className="stars mb-3">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <i key={i} className="fas fa-star" />
                    ))}
                  </div>
                  <p className="fst-italic">{t.quote}</p>
                  <h6 className="fw-bold mb-0">{t.author}</h6>
                  <p className="small text-muted">{t.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery-section">
        <div className="container">
          <SectionHeader
            eyebrow="Campus Life"
            title="Our"
            highlight="Gallery"
            subtitle="Glimpses from our vibrant school community and learning environment"
          />
          <div className="row g-3 justify-content-center">
            {galleryPhotos.map((img) => (
              <div key={img.id} className="col-md-4">
                <div className="gallery-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.imageUrl} alt={img.alt} />
                  {(img.title || img.caption) && (
                    <div className="gallery-item__caption">
                      {img.title && <strong>{img.title}</strong>}
                      {img.caption && <span>{img.caption}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {galleryPhotos.length > 0 && (
            <div className="text-center mt-4">
              <Link href="/gallery" className="btn btn-orange">
                View Full Gallery
                <i className="fas fa-arrow-right ms-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="cta-section text-white text-center">
        <div className="container">
          <SectionHeader
            eyebrow="Join Us"
            title="Ready to Begin Your"
            highlight="Child's Journey?"
            subtitle="Give your child the foundation of quality education in a nurturing, inspiring environment"
            light
          />
          <Link href="/admissions" className="btn btn-orange btn-lg">
            Start Application Process
            <i className="fas fa-arrow-right ms-2" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
