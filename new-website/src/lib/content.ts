import { head, put } from "@vercel/blob";
import { defaultContent, CONTENT_BLOB_PATH } from "@/data/default-content";
import type { SiteContent } from "@/types/content";

export async function getSiteContent(): Promise<SiteContent> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return defaultContent;
  }

  try {
    const blobHead = await head(CONTENT_BLOB_PATH);
    if (!blobHead?.downloadUrl) {
      return defaultContent;
    }

    const response = await fetch(blobHead.downloadUrl, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return defaultContent;
    }

    const data = (await response.json()) as SiteContent;
    return mergeWithDefaults(data);
  } catch {
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
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
