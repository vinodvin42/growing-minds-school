import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import AdmissionForm from "@/components/AdmissionForm";

export const metadata: Metadata = {
  title: "Admissions 2026-2027",
  description: "Apply for admission at Growing Minds English School. Online application for Nursery to 8th Standard.",
};

export default function AdmissionsPage() {
  return (
    <SiteLayout activePath="/admissions">
      <PageHero
        title="Admissions 2026–2027"
        subtitle="Begin your child's journey with Growing Minds English School"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
      />

      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card form-card-pro">
                <div className="card-header bg-gradient-orange text-white text-center py-4">
                  <h2 className="mb-1 h3">Online Admission Application</h2>
                  <p className="mb-0 opacity-75 small">Please complete all mandatory fields and upload required documents</p>
                </div>
                <div className="card-body p-4">
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
