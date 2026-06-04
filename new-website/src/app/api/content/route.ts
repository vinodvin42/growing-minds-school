import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { CONTENT_REVALIDATE_PATHS, getSiteContent, saveSiteContent } from "@/lib/content";
import { isAuthenticated } from "@/lib/auth";
import type { SiteContent } from "@/types/content";

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
    const saved = await saveSiteContent(content);
    for (const path of CONTENT_REVALIDATE_PATHS) {
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
