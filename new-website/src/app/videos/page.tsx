import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import VideoGrid from "@/components/VideoGrid";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Video Library",
  description: "Watch school tour videos, events, and activities at Growing Minds English School.",
};

export default async function VideosPage() {
  const content = await getSiteContent();

  return (
    <SiteLayout activePath="/videos">
      <PageHero
        title="Video Library"
        subtitle="Explore our campus, events, and learning environment"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Videos" }]}
      />

      <section className="py-5">
        <div className="container">
          <SectionHeader
            eyebrow="Media"
            title="School"
            highlight="Videos"
            subtitle="Tour our campus, watch events, and see our students in action"
          />
          <VideoGrid videos={content.videos} />
        </div>
      </section>
    </SiteLayout>
  );
}
