import type { Metadata } from "next";
import { Suspense } from "react";
import SiteLayout from "@/components/SiteLayout";
import PageHero from "@/components/PageHero";
import InstallAppGuide from "@/components/InstallAppGuide";

export const metadata: Metadata = {
  title: "Install School App",
  description: "Install the Growing Minds app to access the student and parent portal.",
  robots: { index: true, follow: true },
};

export default function InstallAppPage() {
  return (
    <SiteLayout activePath="/install-app">
      <PageHero
        title="Install School App"
        subtitle="Student login and portal pages open inside the installed app only"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Install App" }]}
      />

      <section className="py-4">
        <div className="container">
          <Suspense fallback={<div className="text-center py-4 text-muted">Loading…</div>}>
            <InstallAppGuide />
          </Suspense>
        </div>
      </section>
    </SiteLayout>
  );
}
