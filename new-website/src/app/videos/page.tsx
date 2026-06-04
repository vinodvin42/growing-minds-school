import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import VideoGrid from "@/components/VideoGrid";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Video Library",
  description: "School tours, events, and activities at Growing Minds English School.",
};

export default async function VideosPage() {
  const content = await getSiteContent();

  return (
    <SiteLayout activePath="/videos">
      <PageHero
        title="Video Library"
        subtitle="Campus tours, events, and student moments"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Videos" }]}
      />

      <section className="py-4">
        <div className="container">
          <VideoGrid videos={content.videos} />
        </div>
      </section>
    </SiteLayout>
  );
}
