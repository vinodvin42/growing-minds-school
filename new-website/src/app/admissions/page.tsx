import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import AdmissionForm from "@/components/AdmissionForm";

export const metadata: Metadata = {
  title: "Admissions 2026-2027",
  description:
    "Apply for admission at Growing Minds English School. Online application for Nursery to 8th Standard.",
};

const CHECKLIST_ITEMS = [
  "Student details (name, DOB, gender, standard)",
  "Student documents (birth certificate, photo, Aadhaar)",
  "Parent contact details and email",
  "Father & mother Aadhaar and photographs",
  "Current & permanent address with electricity bill",
  "Sibling details (if applicable)",
];

export default function AdmissionsPage() {
  return (
    <SiteLayout activePath="/admissions">
      <PageHero
        title="Admissions 2026–2027"
        subtitle="Apply online for Nursery to 8th Standard"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
      />

      <section className="admission-page-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4 admission-layout__sidebar">
              <aside className="admission-checklist">
                <div className="admission-checklist__header">
                  <h3>Before you apply</h3>
                  <p>Keep these documents ready on your phone or computer</p>
                </div>
                <div className="admission-checklist__body">
                  <ul className="admission-checklist__list">
                    {CHECKLIST_ITEMS.map((item) => (
                      <li key={item}>
                        <i className="fas fa-check-circle" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="admission-checklist__tip">
                    <strong>Tip:</strong> Use clear photos or PDF scans. Each file must be under 5 MB. You can expand
                    one section at a time while filling the form.
                  </p>
                </div>
              </aside>
            </div>

            <div className="col-lg-8">
              <div className="admission-form-card">
                <div className="admission-form-card__header">
                  <span className="admission-form-card__badge">Academic Year 2026–27</span>
                  <h2 className="admission-form-card__title">Online Admission Application</h2>
                  <p className="admission-form-card__subtitle">
                    Complete each section below. Required fields are marked with an asterisk.
                  </p>
                </div>
                <div className="admission-form-card__body">
                  <AdmissionForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
