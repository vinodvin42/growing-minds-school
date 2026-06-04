import type { CarouselSlide, GalleryImage } from "@/types/content";

/** Keep logo out of carousel and gallery — logo belongs in navbar/footer only. */
export function filterLogoFromSlides(slides: CarouselSlide[]): CarouselSlide[] {
  return slides.filter((s) => !s.imageUrl.includes("logo"));
}

export function filterLogoFromGallery(items: GalleryImage[]): GalleryImage[] {
  return items.filter((i) => !i.imageUrl.includes("logo"));
}