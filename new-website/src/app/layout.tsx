import type { Metadata, Viewport } from "next";
import "./globals.css";
import { images } from "@/data/images";
import { getDefaultOpenGraph } from "@/lib/seo";
import { PWA } from "@/lib/pwa";
import AppProviders from "@/components/AppProviders";
import PwaInstallHint from "@/components/PwaInstallHint";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://growingminds.vercel.app"),
  applicationName: PWA.shortName,
  title: {
    default: "Growing Minds English School | Best Preschool & Primary School in Malad West Mumbai",
    template: "%s | Growing Minds English School",
  },
  description: PWA.description,
  keywords: [
    "growing minds english school",
    "best school malad west",
    "preschool mumbai",
    "nursery admission mumbai",
    "english medium school mumbai",
  ],
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: PWA.shortName,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
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
    images: [images.logoOriginal],
  },
  icons: {
    icon: images.favicon,
    shortcut: images.favicon,
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: PWA.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content={PWA.shortName} />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen d-flex flex-column">
        <AppProviders>
          {children}
          <PwaInstallHint />
        </AppProviders>
      </body>
    </html>
  );
}
