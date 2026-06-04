import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <div className="offline-page__card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="offline-page__icon" />
        <h1>You&apos;re offline</h1>
        <p>Check your internet connection, then try again.</p>
        <Link href="/" className="btn btn-orange">
          Go to Home
        </Link>
      </div>
    </main>
  );
}
