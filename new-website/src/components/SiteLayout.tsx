import Script from "next/script";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/content";

export default async function SiteLayout({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath: string;
}) {
  const content = await getSiteContent();

  return (
    <>
      <TopBar settings={content.settings} />
      <Navbar settings={content.settings} activePath={activePath} />
      <main className="flex-grow-1">{children}</main>
      <Footer settings={content.settings} />
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        strategy="afterInteractive"
      />
    </>
  );
}
