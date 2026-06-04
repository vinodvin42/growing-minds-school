import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSiteContent, saveSiteContent } from "@/lib/content";
import { isAuthenticated } from "@/lib/auth";
import type { SiteContent } from "@/types/content";

const CONTENT_PATHS = ["/", "/about", "/gallery", "/news", "/videos", "/contact", "/admissions"] as const;

export async function GET() {
  const content = await getSiteContent();
  return NextResponse.json(content, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = (await request.json()) as SiteContent;
    await saveSiteContent(content);
    const saved = await getSiteContent();
    for (const path of CONTENT_PATHS) {
      revalidatePath(path);
    }
    return NextResponse.json({
      success: true,
      message: "Content saved successfully",
      content: saved,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save content";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
