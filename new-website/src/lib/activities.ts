import type { StudentActivity } from "@/types/content";

export const ACTIVITY_CATEGORIES = [
  "Art & Craft",
  "Sports",
  "Music & Dance",
  "Science & Discovery",
  "Celebrations",
  "Reading & Library",
  "Other",
] as const;

const CATEGORY_EMOJI: Record<string, string> = {
  "Art & Craft": "🎨",
  Sports: "⚽",
  "Music & Dance": "🎵",
  "Science & Discovery": "🔬",
  Celebrations: "🎉",
  "Reading & Library": "📚",
  Other: "🌟",
};

const CATEGORY_COLOR: Record<string, string> = {
  "Art & Craft": "activity-card--orange",
  Sports: "activity-card--lime",
  "Music & Dance": "activity-card--purple",
  "Science & Discovery": "activity-card--blue",
  Celebrations: "activity-card--yellow",
  "Reading & Library": "activity-card--red",
  Other: "activity-card--teal",
};

export function activityEmoji(category: string) {
  return CATEGORY_EMOJI[category] ?? "🌟";
}

export function activityColorClass(category: string) {
  return CATEGORY_COLOR[category] ?? "activity-card--teal";
}

export function pickHomepageActivities(activities: StudentActivity[], limit = 3) {
  const withImages = activities.filter((a) => a.imageUrl);
  const featured = withImages.filter((a) => a.featured);
  const source = featured.length > 0 ? featured : withImages;
  return source.slice(0, limit);
}

/** Paragraphs for the article detail view */
export function activityArticleParagraphs(activity: StudentActivity): string[] {
  const source = activity.body?.trim() || activity.description.trim();
  if (!source) return [];
  return source
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Lead line under the title in the article view */
export function activityArticleLead(activity: StudentActivity): string | null {
  const body = activity.body?.trim();
  const summary = activity.description.trim();
  if (body && summary && summary !== body.trim()) return summary;
  return null;
}
