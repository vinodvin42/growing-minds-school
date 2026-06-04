"use client";

import { SerwistProvider } from "@serwist/turbopack/react";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "development") {
    return <>{children}</>;
  }

  return <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>;
}
