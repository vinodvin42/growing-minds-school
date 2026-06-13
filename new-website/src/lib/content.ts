import { unstable_noStore as noStore } from "next/cache";
import { defaultContent, CONTENT_BLOB_PATH } from "@/data/default-content";
import { isStorageConfigured } from "@/lib/blob-storage";
import { readStorageText, writeStorageText } from "@/lib/storage/index";
import type { SiteContent } from "@/types/content";

/** Public pages that render CMS content — revalidate after admin saves. */
export const CONTENT_REVALIDATE_PATHS = [
  "/",
  "/about",
  "/activities",
  "/gallery",
  "/news",
  "/videos",
  "/contact",
  "/admissions",
] as const;

export function normalizeSiteContent(data: Partial<SiteContent>): SiteContent {
  return mergeWithDefaults(data);
}

export async function getSiteContent(): Promise<SiteContent> {
  noStore();

  if (!isStorageConfigured()) {
    return defaultContent;
  }

  try {
    const text = await readStorageText(CONTENT_BLOB_PATH);
    if (!text?.trim()) {
      return defaultContent;
    }
    return mergeWithDefaults(JSON.parse(text) as SiteContent);
  } catch (error) {
    console.error("Failed to load site content:", error);
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const normalized = mergeWithDefaults(content);

  if (!isStorageConfigured()) {
    throw new Error("Storage is not configured.");
  }

  await writeStorageText(CONTENT_BLOB_PATH, JSON.stringify(normalized, null, 2));
  return normalized;
}

function mergeWithDefaults(data: Partial<SiteContent>): SiteContent {
  return {
    settings: { ...defaultContent.settings, ...data.settings },
    homepage: { ...defaultContent.homepage, ...data.homepage },
    about: {
      ...defaultContent.about,
      ...data.about,
      values: data.about?.values ?? defaultContent.about.values,
      approachPoints: data.about?.approachPoints ?? defaultContent.about.approachPoints,
    },
    carousel: data.carousel ?? defaultContent.carousel,
    programs: data.programs ?? defaultContent.programs,
    enrollmentSteps: data.enrollmentSteps ?? defaultContent.enrollmentSteps,
    teachers: data.teachers ?? defaultContent.teachers,
    testimonials: data.testimonials ?? defaultContent.testimonials,
    gallery: data.gallery ?? defaultContent.gallery,
    activitiesSection: { ...defaultContent.activitiesSection, ...data.activitiesSection },
    activities: data.activities ?? defaultContent.activities,
    videos: data.videos ?? defaultContent.videos,
    news: data.news ?? defaultContent.news,
    newsAnnouncement: { ...defaultContent.newsAnnouncement, ...data.newsAnnouncement },
  };
}
