import type { Metadata } from "next";
import "./globals.css";
import { getDefaultOpenGraph } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://growingminds.vercel.app"),
  title: {
    default: "Growing Minds English School | Best Preschool & Primary School in Malad West Mumbai",
    template: "%s | Growing Minds English School",
  },
  description:
    "Growing Minds English School - Quality English-medium education from Nursery to 8th Standard in Malad West, Mumbai. Admissions Open for 2026-2027.",
  keywords: [
    "growing minds english school",
    "best school malad west",
    "preschool mumbai",
    "nursery admission mumbai",
    "english medium school mumbai",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    ...getDefaultOpenGraph(),
    title: "Growing Minds English School | Best Preschool & Primary School in Mumbai",
    description:
      "Quality English-medium education from Nursery to 8th Standard. Admissions Open for 2026-2027 in Malad West, Mumbai.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Growing Minds English School",
    description: "Quality English-medium education from Nursery to 8th Standard. Admissions Open 2026-2027.",
    images: ["/assets/images/logo.jpg"],
  },
  icons: {
    icon: "/assets/images/logo-100.jpg",
    shortcut: "/assets/images/logo-100.jpg",
    apple: "/assets/images/logo-100.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body className="min-h-screen d-flex flex-column">{children}</body>
    </html>
  );
}
