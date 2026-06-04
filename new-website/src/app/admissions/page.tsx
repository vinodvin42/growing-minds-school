import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import AdmissionForm from "@/components/AdmissionForm";
import AdmissionApplyHelp from "@/components/AdmissionApplyHelp";

export const metadata: Metadata = {
  title: "Admissions 2026-2027",
  description:
    "Apply for admission at Growing Minds English School. Online application for Nursery to 8th Standard.",
};

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
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="admission-form-card">
                <div className="admission-form-card__header">
                  <AdmissionApplyHelp />
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
