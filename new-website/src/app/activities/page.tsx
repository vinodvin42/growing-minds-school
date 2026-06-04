import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import StudentActivitiesGrid from "@/components/StudentActivitiesGrid";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Student Activities",
  description: "Art, sports, music, and fun learning at Growing Minds English School.",
};

export default async function ActivitiesPage() {
  const content = await getSiteContent();
  const { activitiesSection, activities } = content;
  const items = activities.filter((a) => a.imageUrl);

  return (
    <SiteLayout activePath="/activities">
      <PageHero
        title={`${activitiesSection.title} ${activitiesSection.highlight}`.trim()}
        subtitle={activitiesSection.subtitle}
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Activities" }]}
      />

      <section className="activities-page-section py-4">
        <div className="container">
          <StudentActivitiesGrid activities={items} />
        </div>
      </section>
    </SiteLayout>
  );
}
