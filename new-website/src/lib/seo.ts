import type { SiteSettings } from "@/types/content";
import { images } from "@/data/images";

export function getSchoolJsonLd(settings: SiteSettings) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://growingminds.vercel.app";

  return {
    "@context": "https://schema.org",
    "@type": "School",
    name: settings.schoolName,
    description: "Quality English-medium education from Nursery to 8th Standard",
    url: baseUrl,
    logo: `${baseUrl}${images.logo}`,
    image: `${baseUrl}${images.schoolBuilding}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Shop No. D1, Plot No. 17, Malwani Ashwamegh CHS LTD., RSC 08, Mhada, Malwani",
      addressLocality: "Malad West",
      addressRegion: "Mumbai",
      postalCode: "400095",
      addressCountry: "IN",
    },
    telephone: settings.phone.replace(/\s/g, "-"),
    email: settings.email,
    priceRange: "Contact for details",
  };
}

export function getDefaultOpenGraph() {
  return {
    type: "website" as const,
    locale: "en_IN",
    siteName: "Growing Minds English School",
    images: [
      {
        url: images.logo,
        width: 1200,
        height: 630,
        alt: "Growing Minds English School",
      },
    ],
  };
}
