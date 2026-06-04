export interface SiteSettings {
  schoolName: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  officeHours: string;
  mapEmbedUrl: string;
  footerDescription: string;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  /** @deprecated Use title — kept for older saved content */
  caption: string;
  alt: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
  imagePosition?: "left" | "right";
  /** @deprecated Use imageFocusX / imageFocusY */
  imageFocus?: string;
  imageFit?: "cover" | "contain";
  imageFocusX?: number;
  imageFocusY?: number;
}

export interface Program {
  id: string;
  icon: string;
  title: string;
  ageRange: string;
  description: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  experience: string;
  photoUrl: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  subtitle: string;
  stars: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  alt: string;
  title?: string;
  caption?: string;
  category?: string;
}

export interface StudentActivity {
  id: string;
  title: string;
  /** Short summary shown on activity cards */
  description: string;
  /** Full article for the detail view — use blank lines between paragraphs */
  body?: string;
  imageUrl: string;
  alt: string;
  category: string;
  dateLabel?: string;
  featured?: boolean;
}

export interface ActivitiesSectionContent {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: "tour" | "events" | "activities" | "other";
  featured: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  dateLabel: string;
  icon: string;
  headerColor: string;
  linkUrl?: string;
  linkText?: string;
}

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  introTitle: string;
  introText: string;
  introLead: string;
  introImageUrl: string;
  /** @deprecated Use introImageFocusX / introImageFocusY */
  introImageFocus?: string;
  introImageFit?: "cover" | "contain";
  introImageFocusX?: number;
  introImageFocusY?: number;
  vision: string;
  visionExtra: string;
  mission: string;
  missionExtra: string;
  values: { icon: string; title: string; description: string; colorClass: string }[];
  approachTitle: string;
  approachLead: string;
  approachPoints: { title: string; description: string }[];
  approachImageUrl: string;
  /** @deprecated Use approachImageFocusX / approachImageFocusY */
  approachImageFocus?: string;
  approachImageFit?: "cover" | "contain";
  approachImageFocusX?: number;
  approachImageFocusY?: number;
}

export interface HomepageContent {
  badge: string;
  heroTitle: string;
  heroHighlight: string;
  heroTagline: string;
  heroDescription: string;
  admissionTitle: string;
  admissionYear: string;
  admissionGrades: string;
  featuredVideoButtonText: string;
}

export interface SiteContent {
  settings: SiteSettings;
  homepage: HomepageContent;
  about: AboutContent;
  carousel: CarouselSlide[];
  programs: Program[];
  enrollmentSteps: { number: number; icon: string; title: string; description: string; colorClass: string }[];
  teachers: Teacher[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
  activitiesSection: ActivitiesSectionContent;
  activities: StudentActivity[];
  videos: VideoItem[];
  news: NewsItem[];
  newsAnnouncement: {
    title: string;
    subtitle: string;
    description: string;
  };
}
