import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { migrateStorageLayout } from "@/lib/storage-migrate";

/** One-time: move legacy Blob files into portal/ layout + create manifest.json (safe on Vercel). */
export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const report = await migrateStorageLayout();
  return NextResponse.json({
    success: report.success,
    message: report.success
      ? "Storage migration completed."
      : "Migration finished with errors.",
    report,
  });
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "POST to this endpoint to migrate legacy Blob data into portal/ layout and rebuild manifest.json.",
  });
}
