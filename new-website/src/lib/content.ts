import fs from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { get, put } from "@vercel/blob";
import { defaultContent, CONTENT_BLOB_PATH } from "@/data/default-content";
import { blobAccess, blobReadAccessModes, isBlobStorageConfigured } from "@/lib/blob-storage";
import type { SiteContent } from "@/types/content";

const LOCAL_CONTENT_FILE = path.join(process.cwd(), ".data", "site-content.json");

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

  if (!isBlobStorageConfigured()) {
    const local = await readLocalContentFile();
    if (local) {
      return mergeWithDefaults(JSON.parse(local) as SiteContent);
    }
    return defaultContent;
  }

  try {
    const text = await readContentBlob();
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

  if (!isBlobStorageConfigured()) {
    await writeLocalContentFile(normalized);
    return normalized;
  }

  await put(CONTENT_BLOB_PATH, JSON.stringify(normalized, null, 2), {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });

  return normalized;
}

async function readLocalContentFile(): Promise<string | null> {
  try {
    const text = await fs.readFile(LOCAL_CONTENT_FILE, "utf8");
    return text.trim() ? text : null;
  } catch {
    return null;
  }
}

async function writeLocalContentFile(content: SiteContent): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_CONTENT_FILE), { recursive: true });
  await fs.writeFile(LOCAL_CONTENT_FILE, JSON.stringify(content, null, 2), "utf8");
}

/** Read CMS JSON from Blob — supports legacy private blobs when store allows it. */
async function readContentBlob(): Promise<string | null> {
  for (const access of blobReadAccessModes()) {
    try {
      const result = await get(CONTENT_BLOB_PATH, { access });
      if (result?.statusCode === 200 && result.stream) {
        return await new Response(result.stream).text();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes("not found")) {
        console.error(`Failed to load site content (${access}):`, error);
      }
    }
  }
  return null;
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
