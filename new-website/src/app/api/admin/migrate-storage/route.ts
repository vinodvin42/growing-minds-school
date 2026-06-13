import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  bootstrapPortalManifestFromStorage,
  clearPortalManifestCache,
  savePortalManifest,
} from "@/lib/portal-manifest";

/** Rebuild portal/manifest.json from files already in storage. */
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    clearPortalManifestCache();
    const manifest = await bootstrapPortalManifestFromStorage();
    await savePortalManifest(manifest);
    return NextResponse.json({
      success: true,
      message: "Portal manifest rebuilt from storage.",
      manifest,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Manifest rebuild failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "POST to rebuild portal/manifest.json from existing storage files.",
  });
}
