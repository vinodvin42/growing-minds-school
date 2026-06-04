import { get, put } from "@vercel/blob";
import { defaultContent, CONTENT_BLOB_PATH } from "@/data/default-content";
import { blobStorageErrorMessage, isBlobStorageConfigured } from "@/lib/blob-storage";
import type { SiteContent } from "@/types/content";

export async function getSiteContent(): Promise<SiteContent> {
  if (!isBlobStorageConfigured()) {
    return defaultContent;
  }

  try {
    const result = await get(CONTENT_BLOB_PATH, { access: "public" });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return defaultContent;
    }

    const text = await new Response(result.stream).text();
    if (!text.trim()) {
      return defaultContent;
    }

    const data = JSON.parse(text) as SiteContent;
    return mergeWithDefaults(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("not found")) {
      return defaultContent;
    }
    console.error("Failed to load site content from Blob:", error);
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (!isBlobStorageConfigured()) {
    throw new Error(blobStorageErrorMessage());
  }

  await put(CONTENT_BLOB_PATH, JSON.stringify(content, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
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
    videos: data.videos ?? defaultContent.videos,
    news: data.news ?? defaultContent.news,
    newsAnnouncement: { ...defaultContent.newsAnnouncement, ...data.newsAnnouncement },
  };
}
