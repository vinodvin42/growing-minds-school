import type { Metadata } from "next";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import { getSiteContent } from "@/lib/content";
import { filterLogoFromGallery } from "@/lib/media";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Photos from campus life and events at Growing Minds English School.",
};

export default async function GalleryPage() {
  const content = await getSiteContent();
  const photos = filterLogoFromGallery(content.gallery).filter((img) => img.imageUrl);

  return (
    <SiteLayout activePath="/gallery">
      <PageHero
        title="Photo Gallery"
        subtitle="Campus moments, events, and daily school life"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />

      <section className="gallery-page-section py-4">
        <div className="container">
          <GalleryGrid images={photos} />
        </div>
      </section>
    </SiteLayout>
  );
}
