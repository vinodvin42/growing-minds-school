import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import GalleryGrid from "@/components/GalleryGrid";
import { getSiteContent } from "@/lib/content";
import { filterLogoFromGallery } from "@/lib/media";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Browse photos from campus life, events, and activities at Growing Minds English School.",
};

export default async function GalleryPage() {
  const content = await getSiteContent();
  const photos = filterLogoFromGallery(content.gallery).filter((img) => img.imageUrl);

  return (
    <SiteLayout activePath="/gallery">
      <PageHero
        title="Photo Gallery"
        subtitle="Moments from our campus, classrooms, events, and vibrant school community"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="gallery-page-section py-5">
        <div className="container">
          <SectionHeader
            eyebrow="Campus Life"
            title="School"
            highlight="Gallery"
            subtitle="Explore photos uploaded and curated by our team — tap any image to view it full size with details"
          />
          <GalleryGrid images={photos} />
        </div>
      </section>
    </SiteLayout>
  );
}
