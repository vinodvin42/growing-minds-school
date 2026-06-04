"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessStudentPortal } from "@/lib/pwa-client";

export default function StudentPortalGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (canAccessStudentPortal()) {
      setAllowed(true);
      return;
    }
    const params = new URLSearchParams();
    if (pathname) params.set("from", pathname);
    router.replace(`/install-app?${params.toString()}`);
  }, [pathname, router]);

  if (allowed !== true) {
    return (
      <div className="student-portal-gate">
        <div className="spinner-border text-orange" role="status" aria-label="Loading student portal" />
      </div>
    );
  }

  return <>{children}</>;
}
